// includes
import * as azs from 'azure-storage';
import * as util from 'util';
import AzureQueueOperation from './AzureQueueOperation';
import ReadableStream from './ReadableStream';
import { IStreamOptions } from './Stream';
import WriteableStream from './WriteableStream';

export type encoders = 'base64' | 'xml' | 'binary';

export interface IAzureQueueOptions {
    service?: azs.QueueService;
    useGlobalAgent?: boolean;
    connectionString?: string;
    account?: string;
    sas?: string;
    key?: string;
    encoder?: encoders;
}

interface IAzureQueueStreams<T, U> {
    in: WriteableStream<T, AzureQueueOperation>;
    out: ReadableStream<AzureQueueOperation, U>;
}

export default class AzureQueue {
    public service: azs.QueueService;

    constructor(obj: IAzureQueueOptions) {
        // establish the service
        if (obj.service) {
            this.service = obj.service;
        } else if (obj.connectionString) {
            this.service = azs.createQueueService(obj.connectionString);
            if (obj.encoder) this.encoder = obj.encoder;
            if (obj.useGlobalAgent) this.service.enableGlobalHttpAgent = true;
        } else if (obj.account && obj.sas) {
            const host = `https://${obj.account}.queue.core.windows.net`;
            this.service = azs.createQueueServiceWithSas(host, obj.sas);
            if (obj.encoder) this.encoder = obj.encoder;
            if (obj.useGlobalAgent) this.service.enableGlobalHttpAgent = true;
        } else if (obj.account && obj.key) {
            this.service = azs.createQueueService(obj.account, obj.key);
            if (obj.encoder) this.encoder = obj.encoder;
            if (obj.useGlobalAgent) this.service.enableGlobalHttpAgent = true;
        } else {
            throw new Error(
                'You must specify service, connectionString, account/sas, or account/key.'
            );
        }
    }

    /** Returns *true* if there are any messages in the queue. */
    public async hasMessages(queue: string) {
        const getQueueMetadata: (
            queue: string
        ) => Promise<azs.QueueService.QueueResult> = util
            .promisify(azs.QueueService.prototype.getQueueMetadata)
            .bind(this.service);
        const result = await getQueueMetadata(queue);
        if (result.approximateMessageCount == null) {
            return true; // it is safer to assume there could be
        }
        return result.approximateMessageCount > 0;
    }

    public queueStream<
        In = AzureQueueOperation,
        Out = AzureQueueOperation
    >(): IAzureQueueStreams<In, Out>;

    public queueStream<In = AzureQueueOperation, Out = AzureQueueOperation>(
        inOptions: IStreamOptions<In, AzureQueueOperation>,
        outOptions: IStreamOptions<AzureQueueOperation, Out>
    ): IAzureQueueStreams<In, Out>;

    public queueStream<In = string, Out = string>(): IAzureQueueStreams<
        In,
        Out
    > {
        // get arguments
        const inOptions: IStreamOptions<In, AzureQueueOperation> =
            arguments[0] || {};
        const outOptions: IStreamOptions<AzureQueueOperation, Out> =
            arguments[1] || {};

        // create the streams
        const streams: IAzureQueueStreams<In, Out> = {
            in: new WriteableStream<In, AzureQueueOperation>(inOptions),
            out: new ReadableStream<AzureQueueOperation, Out>(outOptions)
        };

        // promisify
        const createMessage: (
            queue: string,
            message: string
        ) => Promise<azs.QueueService.QueueMessageResult> = util
            .promisify(azs.QueueService.prototype.createMessage)
            .bind(this.service);

        // produce promises to commit the operations
        streams.out
            .process(streams.in, () => {
                // enqueue
                const op = streams.in.buffer.shift();
                if (op) {
                    const toString =
                        typeof op.message === 'object'
                            ? JSON.stringify(op.message)
                            : op.message;
                    return createMessage(op.queue, toString || '')
                        .then(result => {
                            streams.out.emit('success', result);
                            op.resolve(result);
                        })
                        .catch(error => {
                            streams.out.emit('error', error);
                            op.reject(error);
                        });
                }

                // nothing else to do
                return null;
            })
            .catch(error => {
                streams.out.emit('error', error);
            });

        return streams;
    }

    public queue<In = AzureQueueOperation, Out = any>(
        operations: In | In[],
        inOptions?: IStreamOptions<In, AzureQueueOperation>,
        outOptions?: IStreamOptions<any, Out>
    ): ReadableStream<any, Out> {
        // start the stream
        const streams = this.queueStream<In, Out>(
            inOptions || {},
            outOptions || {}
        );

        // push the operations
        if (Array.isArray(operations)) {
            for (const operation of operations) {
                streams.in.push(operation);
            }
        } else {
            streams.in.push(operations);
        }

        // end the input stream
        streams.in.end();
        return streams.out;
    }

    public queueAsync<In = AzureQueueOperation, Out = any>(
        operations: In | In[],
        inOptions?: IStreamOptions<In, AzureQueueOperation>,
        outOptions?: IStreamOptions<any, Out>
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                // start commit
                const stream = this.queue(operations, inOptions, outOptions);

                // resolve when done
                stream.once('end', () => {
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    public enqueueMessages(queue: string, messages: string[] | object[]) {
        const operations: AzureQueueOperation[] = [];
        for (const message of messages) {
            const toString =
                typeof message === 'object' ? JSON.stringify(message) : message;
            operations.push(
                new AzureQueueOperation(queue, 'enqueue', toString)
            );
        }
        return this.queueAsync(operations);
    }

    // add a single message to the queue
    public enqueueMessage(queue: string, message: string | object) {
        const createMessage: (
            queue: string,
            message: string
        ) => Promise<azs.QueueService.QueueMessageResult> = util
            .promisify(azs.QueueService.prototype.createMessage)
            .bind(this.service);
        const toString =
            typeof message === 'object' ? JSON.stringify(message) : message;
        return createMessage(queue, toString);
    }

    public dequeueMessages(queue: string, count: number = 1) {
        const getMessages: (
            queue: string,
            options: azs.QueueService.GetMessagesRequestOptions
        ) => Promise<azs.QueueService.QueueMessageResult[]> = util
            .promisify(azs.QueueService.prototype.getMessages)
            .bind(this.service);
        return getMessages(queue, {
            numOfMessages: count
        });
    }

    /** A Promise to create the queue if it doesn't exist. */
    public createQueueIfNotExists(queue: string) {
        const createQueueIfNotExists: (
            queue: string
        ) => Promise<azs.QueueService.QueueResult> = util
            .promisify(azs.QueueService.prototype.createQueueIfNotExists)
            .bind(this.service);
        return createQueueIfNotExists(queue);
    }

    /** Specify the encoding method ("base64" | "xml" | "binary"). */
    public set encoder(option: encoders) {
        switch (option) {
            case 'base64':
                this.service.messageEncoder = new azs.QueueMessageEncoder.TextBase64QueueMessageEncoder();
                break;
            case 'xml':
                this.service.messageEncoder = new azs.QueueMessageEncoder.TextXmlQueueMessageEncoder();
                break;
            case 'binary':
                this.service.messageEncoder = new azs.QueueMessageEncoder.BinaryBase64QueueMessageEncoder();
                break;
        }
    }
}
