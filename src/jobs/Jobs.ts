// includes
import * as azs from 'azure-storage';
import AzureQueue from '../lib/AzureQueue';
import AzureQueueOperation from '../lib/AzureQueueOperation';
import AzureTable from '../lib/AzureTable';
import AzureTableOperation from '../lib/AzureTableOperation';
import ReadableStream from '../lib/ReadableStream';
import WriteableStream from '../lib/WriteableStream';
import Job, { ICreateJob } from './Job';
import Task from './Task';

//  extends Array<Job>
export default class Jobs {
    public azureTable: AzureTable;
    public azureQueue: AzureQueue;
    public tableIn: WriteableStream<AzureTableOperation, AzureTableOperation>;
    public tableOut: ReadableStream<AzureTableOperation, Job>;
    public queueIn: WriteableStream<AzureQueueOperation, AzureQueueOperation>;
    public queueOut: ReadableStream<AzureQueueOperation, AzureQueueOperation>;
    private createJobsTable: Promise<any>;

    constructor(account: string, key: string) {
        // create the table in & out streams
        this.azureTable = new AzureTable({
            account,
            key,
            useGlobalAgent: true
        });
        this.createJobsTable = this.azureTable.createTableIfNotExists('jobs');
        const tableStreams = this.azureTable.queryStream<
            AzureTableOperation,
            Job
        >(
            {
                processAfter: this.createJobsTable
            },
            {
                batchSize: 100,
                transform: data => {
                    const job = new Job(this);
                    job.id = data.PartitionKey._;
                    job.status = data.Status._;
                    return job;
                }
            }
        );
        this.tableIn = tableStreams.in.on('error', error => {
            global.logger.error(error.stack);
        });
        this.tableOut = tableStreams.out.on('error', error => {
            global.logger.error(error.stack);
        });

        // create the queue in & out streams
        this.azureQueue = new AzureQueue({
            account,
            key,
            useGlobalAgent: true
        });
        const createQs: Array<Promise<any>> = [];
        createQs.push(this.azureQueue.createQueueIfNotExists('discovery'));
        const queueStreams = this.azureQueue.queueStream<
            AzureQueueOperation,
            any
        >(
            {
                processAfter: Promise.all(createQs)
            },
            {}
        );
        this.queueIn = queueStreams.in.on('error', error => {
            global.logger.error(error.stack);
        });
        this.queueOut = queueStreams.out.on('error', error => {
            global.logger.error(error.stack);
        });
    }

    public shutdown() {
        this.tableIn.end();
        this.queueIn.end();
    }

    /** A Promise to pause activity on the jobs table, delete everything in it, and then resume. */
    public async clear() {
        // pause the stream
        this.tableOut.pause();
        await this.tableOut.waitForIdle(1000 * 60 * 10); // 10 min max

        // create a new stream for fast delete
        const table = new AzureTable({
            service: this.azureTable.service,
            useGlobalAgent: true
        });
        const streams = table.queryStream<AzureTableOperation, any>(
            {
                processAfter: this.createJobsTable
            },
            {
                batchSize: 100
            }
        );

        // monitor for errors
        let errors = 0;
        streams.in.on('error', error => {
            global.logger.error(error.stack);
            errors++;
        });
        streams.out.on('error', error => {
            global.logger.error(error.stack);
            errors++;
        });

        // query for everything
        const query = new AzureTableOperation(
            'jobs',
            'query',
            new azs.TableQuery()
        ).finally(() => {
            streams.in.end();
        });
        streams.in.push(query);

        // delete everything
        streams.out.on('data', data => {
            const del = new AzureTableOperation('jobs', 'delete', data);
            streams.in.push(del);
        });
        await streams.out.waitForEnd(1000 * 60 * 10); // 10 min max

        // resume the jobs stream
        this.tableOut.resume();

        // throw an exception if there were any stream errors
        if (errors > 0) {
            throw new Error('Jobs.clear() failed due to stream errors');
        }
    }

    /** A Promise to return true if there are any jobs in the table. */
    public async hasJobs() {
        return this.azureTable.hasEntities('jobs');
    }

    public async createJob(definition: ICreateJob) {
        const job = new Job(this);
        await job.create(definition);
        return job;
    }

    public async loadJob(id: string) {
        const job: Job = new Job(this);
        const query = new azs.TableQuery();
        query.where('PartitionKey == ?', id);
        let jobWasLoaded = false;
        const top = new AzureTableOperation('jobs', 'query', query);
        top.while(entity => {
            if (entity.RowKey._ === 'root') {
                job.load(entity);
                jobWasLoaded = true;
            } else {
                const task = new Task(job, entity);
                job.tasks.push(task);
            }
        });
        this.tableIn.push(top);
        await top;
        return jobWasLoaded ? job : null;
    }
}
