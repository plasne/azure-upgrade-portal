// write test cases

// includes
import * as adal from 'adal-node';
import axios from 'axios';
import * as azs from 'azure-storage';
import {
    AzureQueue,
    AzureQueueOperation,
    AzureTable,
    AzureTableOperation,
    PromiseImposter,
    ReadableStream,
    WriteableStream
} from 'azure-storage-stream';
import * as os from 'os';
import { v4 as uuid } from 'uuid';

// options used to create an instance of Discovery
export interface IDiscoveryOptions {
    storageAcount: string;
    storageKey: string;
    directory: string;
    appId: string;
    appKey: string;
}

// definition for a discovery job in the queue
export interface IDiscoveryJob {
    jobId: string;
    operation: string;
    subscriptionId?: string;
}

// definition for a remediation entry
export interface IRemediationEntry {
    remediationAction: string;
    resourceId: string;
    resourceGroup: string;
    vmName: string;
}

// definition of the Discovery class
export default class Discovery {
    public options: IDiscoveryOptions;
    public queue: AzureQueue;
    public inQueue?: WriteableStream<AzureQueueOperation, AzureQueueOperation>;
    public outQueue?: ReadableStream<string, IDiscoveryJob>;
    public table: AzureTable;
    public inTable?: WriteableStream<AzureTableOperation, AzureTableOperation>;
    public outTable?: ReadableStream<any, IRemediationEntry>;

    private dequeueTimer?: NodeJS.Timer;

    /** The Discovery class manages scanning subscriptions for resources that need remediation. */
    public constructor(options: IDiscoveryOptions) {
        this.options = options;

        // connect to the queue
        this.queue = new AzureQueue({
            account: this.options.storageAcount,
            encoder: 'base64',
            key: this.options.storageKey,
            useGlobalAgent: true
        });

        // connect to the table
        this.table = new AzureTable({
            account: this.options.storageAcount,
            key: this.options.storageKey,
            useGlobalAgent: true
        });
    }

    /** This method starts the discovery service listening for new messages for processing. */
    public listen() {
        // start a stream of queue messages
        const queueStreams = this.queue.streams<
            AzureQueueOperation,
            IDiscoveryJob
        >(
            {
                processAfter: this.createDiscoveryQueue()
            },
            {
                transform: data => {
                    return JSON.parse(data) as IDiscoveryJob;
                }
            }
        );
        this.inQueue = queueStreams.in;
        this.outQueue = queueStreams.out;
        this.outQueue.on('error', error => {
            if (global.logger) {
                global.logger.error('error found in outQueue...');
                global.logger.error(error);
            }
        });

        // start a stream of table operations
        const tableStreams = this.table.streams<AzureTableOperation, any>(
            {
                processAfter: this.createResourcesTable()
            },
            {
                /*
                transform: data => {
                    const o: IRemediationEntry = {
                        remediationAction: data.RemediationAction,
                        resourceGroup: data.ResourceGroup,
                        resourceId: data.ResourceId,
                        vmName: data.VmName
                    };
                    return o;
                }
                */
            }
        );
        this.inTable = tableStreams.in;
        this.outTable = tableStreams.out;
        this.outTable.on('error', error => {
            if (global.logger) {
                global.logger.error('error found in outTable...');
                global.logger.error(error);
            }
        });

        // define dequeue function
        const dequeue = () => {
            const op = new AzureQueueOperation('discovery', 'dequeue', 1);
            op.hiddenForSec = 5 * 60; // 5 min * 60 sec/min
            if (this.inQueue) this.inQueue.push(op);
        };

        // every 10 seconds look for a new message
        this.dequeueTimer = setInterval(() => {
            dequeue();
        }, 10 * 1000);

        // process a new message if one was found
        this.outQueue.on(
            'data',
            async (data, _, message: azs.QueueService.QueueMessageResult) => {
                try {
                    if (data && message) {
                        // only attempt to process this message 5 times
                        if (message.dequeueCount && message.dequeueCount < 5) {
                            if (global.logger) {
                                global.logger.info(
                                    `operation: ${data.operation} started...`
                                );
                            }
                            await this.process(data);
                            if (global.logger) {
                                global.logger.info(
                                    `operation: ${data.operation} started...`
                                );
                            }
                        }

                        // delete the message and get a new one
                        if (this.inQueue) {
                            this.inQueue.push(
                                new AzureQueueOperation(
                                    'discovery',
                                    'delete',
                                    message
                                )
                            );
                        }
                        dequeue();
                    }
                } catch (error) {
                    if (global.logger) {
                        global.logger.error(`Error during processing...`);
                        global.logger.error(error);
                    }
                    if (global.writer) {
                        global.writer(
                            'error',
                            `Discovery instance on "${
                                os.hostname
                            }" threw an error during processing...`
                        );
                        global.writer('error', error);
                    }
                }
            }
        );

        // log
        if (global.logger) {
            global.logger.info('discovery started listening...');
        }
    }

    /** This method stops the discovery service from looking for new messages in the queue. */
    public unlisten() {
        if (this.dequeueTimer) {
            clearInterval(this.dequeueTimer);
            this.dequeueTimer = undefined;
        }
        if (this.inQueue) this.inQueue.end();
        if (this.inTable) this.inTable.end();
    }

    /** This method runs the supplied job. */
    public process(job: IDiscoveryJob) {
        switch (job.operation) {
            case 'start':
                return this.start(job);
            case 'unmanaged':
                return this.scanForUnmanaged(job);
            default:
                return Promise.resolve();
        }
    }

    /** Clears a job from the "resources" table. */
    public async clear(jobId: string) {
        if (!this.inTable) {
            throw new Error('You must call listen() first before clear().');
        }

        // keep track of all deletions
        const promises: PromiseImposter[] = [];

        // get a list of all resources
        const query = new azs.TableQuery().where('PartitionKey eq ?', jobId);
        const op = new AzureTableOperation('resources', 'query', query).while(
            result => {
                // delete them as they are found
                if (this.inTable) {
                    const sop = new AzureTableOperation(
                        'resources',
                        'delete',
                        result
                    ).then(
                        () => {
                            if (global.logger) {
                                global.logger.verbose(
                                    `deleted "${
                                        result.RowKey._
                                    }" from "resources" table.`
                                );
                            }
                        },
                        error => {
                            if (global.logger) {
                                global.logger.error(
                                    `error deleting "${
                                        result.RowKey._
                                    }" from "resources" table.`
                                );
                                global.logger.error(error);
                            }
                        }
                    );
                    promises.push(sop);
                    this.inTable.push(sop);
                }
            }
        );
        promises.push(op);
        this.inTable.push(op);

        // wait for everything to finish
        return Promise.all(promises);
    }

    /** "start" performs the following:
     * 1. get an access token.
     * 2. get a list of subscriptions that the APP_ID has access to.
     * 3. enqueue a scan job for each subscription and job type (ex. unmanaged).
     */
    private async start(job: IDiscoveryJob) {
        if (!this.inQueue) {
            throw new Error('You must call listen() first before process().');
        }

        // log the start
        if (global.logger) {
            global.logger.info('operation: ');
        }

        // get a token
        const token = await this.getToken();

        // get a list of subscriptions
        const subscriptions = await this.getSubscriptions(token);

        // create the scan jobs
        for (const subscription of subscriptions) {
            const job1: IDiscoveryJob = {
                jobId: job.jobId,
                operation: 'unmanaged',
                subscriptionId: subscription
            };
            this.inQueue.push(
                new AzureQueueOperation('discovery', 'enqueue', job1)
            );
        }
    }

    /** Query for a list of all VMs but then filter by includeIf(). */
    private async getVirtualMachines(
        subscriptionId: string,
        token: string,
        action: string,
        includeIf: (entry: any) => boolean
    ) {
        const list: IRemediationEntry[] = [];

        // define the iterative fetch function
        const fetch = async (url: string) => {
            await axios
                .get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(async response => {
                    if (response.data.value) {
                        for (const entry of response.data.value) {
                            const isIncluded = includeIf(entry);
                            if (isIncluded) {
                                list.push({
                                    remediationAction: action,
                                    resourceGroup: entry.id.split('/')[4],
                                    resourceId: entry.id,
                                    vmName: entry.name
                                });
                            }
                        }
                    }
                    if (response.data.nextLink) {
                        await fetch(response.data.nextLink);
                    }
                });
        };

        // start fetching
        await fetch(
            `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Compute/virtualMachines?api-version=2018-06-01`
        );

        return list;
    }

    /** Looks for VMs with unmanaged disks and performs the following:
     * 1. get an access token.
     * 2. query for all VMs in the subscription.
     * 3. filter the VMs to those that are unmanaged.
     * 4. write the entries ot the "resources" table.
     */
    private async scanForUnmanaged(job: IDiscoveryJob) {
        if (!this.inTable) {
            throw new Error('You must call listen() first before process().');
        }

        // validate
        if (!job.subscriptionId) {
            throw new Error(
                'scanForUnmanaged() was given a job without a subscriptionId.'
            );
        }

        // get a token
        const token = await this.getToken();

        // get a list of Unmanaged VMs
        if (global.logger) {
            global.logger.verbose(
                `getting list of VMs with unmanaged disks in subscription "${
                    job.subscriptionId
                }"...`
            );
        }
        const unmanaged = await this.getVirtualMachines(
            job.subscriptionId,
            token,
            'unmanaged',
            entry => {
                let isUnmanaged = false;
                if (
                    entry.properties &&
                    entry.properties.storageProfile &&
                    entry.properties.storageProfile.osDisk
                ) {
                    if (!entry.properties.storageProfile.osDisk.managedDisk) {
                        isUnmanaged = true;
                    }
                }
                if (
                    entry.properties &&
                    entry.properties.storageProfile &&
                    entry.properties.storageProfile.dataDisks
                ) {
                    for (const dataDisk of entry.properties.storageProfile
                        .dataDisks) {
                        if (!dataDisk.managedDisk) {
                            isUnmanaged = true;
                        }
                    }
                }
                return isUnmanaged;
            }
        );
        if (global.logger) {
            global.logger.verbose(
                `${
                    unmanaged.length
                } VMs with unmanaged disks found in subscription ${
                    job.subscriptionId
                }.`
            );
        }

        // insert into "resources" table
        const generator = azs.TableUtilities.entityGenerator;
        for (const entry of unmanaged) {
            // log
            if (global.logger) {
                global.logger.info(
                    `VM "${entry.resourceGroup}" "${
                        entry.vmName
                    }" found with unmanaged disks.`
                );
            }

            // push into table
            this.inTable.push(
                new AzureTableOperation('resources', 'insert', {
                    PartitionKey: generator.String(job.jobId),
                    RemediationAction: generator.String(
                        entry.remediationAction
                    ),
                    ResourceGroup: generator.String(entry.resourceGroup),
                    ResourceId: generator.String(entry.resourceId),
                    RowKey: generator.String(uuid()),
                    VmName: generator.String(entry.vmName)
                })
            );
        }
    }

    /** Gets an access token for management.azure.com. */
    private getToken() {
        return new Promise<string>((resolve, reject) => {
            if (global.logger) {
                global.logger.verbose('obtaining access token...');
            }
            const context = new adal.AuthenticationContext(
                `https://login.microsoftonline.com/${this.options.directory}`
            );
            context.acquireTokenWithClientCredentials(
                'https://management.azure.com',
                this.options.appId,
                this.options.appKey,
                (error, tokenResponse) => {
                    if (!error) {
                        const response = tokenResponse as adal.TokenResponse;
                        resolve(response.accessToken);
                        if (global.logger) {
                            global.logger.verbose('access token obtained.');
                        }
                    } else {
                        reject(error);
                    }
                }
            );
        });
    }

    /** Gets a list of subscriptions that APP_ID has access to. */
    private async getSubscriptions(token: string) {
        if (global.logger) {
            global.logger.verbose('getting list of subscriptions...');
        }
        return axios
            .get(
                'https://management.azure.com/subscriptions?api-version=2016-06-01',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            .then(response => {
                const list: string[] = [];
                if (response.data.value) {
                    for (const entry of response.data.value) {
                        list.push(entry.subscriptionId);
                    }
                }
                if (global.logger) {
                    global.logger.verbose(
                        `found access to ${list.length} subscriptions.`
                    );
                }
                return list;
            });
    }

    /** Create the "discovery" queue unless it already exists. */
    private async createDiscoveryQueue() {
        return this.queue
            .createQueueIfNotExists('discovery')
            .then(() => {
                if (global.logger) {
                    global.logger.verbose(
                        'created "discovery" queue or it already existed.'
                    );
                }
            })
            .catch(error => {
                if (global.logger) {
                    global.logger.error('creating "discovery" queue failed...');
                    global.logger.error(error);
                }
            });
    }

    /** Create the "resources" queue unless it already exists. */
    private async createResourcesTable() {
        return this.table
            .createTableIfNotExists('resources')
            .then(() => {
                if (global.logger) {
                    global.logger.verbose(
                        'created "resources" table or it already existed.'
                    );
                }
            })
            .catch(error => {
                if (global.logger) {
                    global.logger.error('creating "resources" table failed...');
                    global.logger.error(error);
                }
            });
    }
}
