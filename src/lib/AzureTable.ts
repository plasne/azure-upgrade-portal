// includes
import * as azs from 'azure-storage';
import AzureTableOperation from './AzureTableOperation';
import ReadableStream from './ReadableStream';
import { IStreamOptions } from './Stream';
import WriteableStream from './WriteableStream';

export interface IAzureTableOptions {
    service?: azs.TableService;
    useGlobalAgent?: boolean;
    connectionString?: string;
    account?: string;
    sas?: string;
    key?: string;
}

interface IAzureTableStreams<T, U> {
    in: WriteableStream<T, AzureTableOperation>;
    out: ReadableStream<any, U>;
}

export default class AzureTable {
    public service: azs.TableService;

    constructor(obj: IAzureTableOptions) {
        // establish the service
        if (obj.service) {
            this.service = obj.service;
        } else if (obj.connectionString) {
            this.service = azs.createTableService(obj.connectionString);
            if (obj.useGlobalAgent) this.service.enableGlobalHttpAgent = true;
        } else if (obj.account && obj.sas) {
            const host = `https://${obj.account}.queue.core.windows.net`;
            this.service = azs.createTableServiceWithSas(host, obj.sas);
            if (obj.useGlobalAgent) this.service.enableGlobalHttpAgent = true;
        } else if (obj.account && obj.key) {
            this.service = azs.createTableService(obj.account, obj.key);
            if (obj.useGlobalAgent) this.service.enableGlobalHttpAgent = true;
        } else {
            throw new Error(
                'You must specify service, connectionString, account/sas, or account/key.'
            );
        }
    }

    public queryStream<
        In = AzureTableOperation,
        Out = any
    >(): IAzureTableStreams<In, Out>;

    public queryStream<In = AzureTableOperation, Out = any>(
        inOptions: IStreamOptions<In, AzureTableOperation>,
        outOptions: IStreamOptions<any, Out>
    ): IAzureTableStreams<In, Out>;

    public queryStream<
        In = AzureTableOperation,
        Out = any
    >(): IAzureTableStreams<In, Out> {
        // get arguments
        const inOptions: IStreamOptions<In, AzureTableOperation> =
            arguments[0] || {};
        const outOptions: IStreamOptions<any, Out> = arguments[1] || {};

        // create the streams
        const streams: IAzureTableStreams<In, Out> = {
            in: new WriteableStream<In, AzureTableOperation>(inOptions),
            out: new ReadableStream<any, Out>(outOptions)
        };

        // produce promises to commit the operations
        streams.out
            .process(streams.in, () => {
                // build a batch
                const batchSize = outOptions.batchSize || 100;
                const operations: AzureTableOperation[] = [];
                const batch = new azs.TableBatch();
                let isRetrieveBatch = false;
                let abort = false;
                do {
                    // get the last item and make sure it can be added to existing batch
                    const operation = streams.in.buffer[0];
                    if (!operation) break;
                    if (
                        // must be in the same table
                        operations.length > 0 &&
                        operations[0].table !== operation.table
                    ) {
                        break;
                    }
                    if (
                        // must be in the same partition
                        operations.length > 0 &&
                        operations[0].partitionKey !== operation.partitionKey
                    ) {
                        break;
                    }

                    // attempt to process the operation
                    let shouldPop = true;
                    switch (operation.type) {
                        case 'delete':
                            batch.deleteEntity(operation.entity);
                            operations.push(operation);
                            break;
                        case 'insert':
                            batch.insertEntity(operation.entity, {});
                            operations.push(operation);
                            break;
                        case 'insertOrMerge':
                            batch.insertOrMergeEntity(operation.entity);
                            operations.push(operation);
                            break;
                        case 'insertOrReplace':
                            batch.insertOrReplaceEntity(operation.entity);
                            operations.push(operation);
                            break;
                        case 'merge':
                            batch.mergeEntity(operation.entity);
                            operations.push(operation);
                            break;
                        case 'replace':
                            batch.replaceEntity(operation.entity);
                            operations.push(operation);
                            break;
                        case 'retrieve':
                            if (batch.size() < 1) {
                                batch.retrieveEntity(
                                    operation.entity.PartitionKey,
                                    operation.entity.RowKey
                                );
                                operations.push(operation);
                                isRetrieveBatch = true;
                            } else {
                                shouldPop = false;
                            }
                            abort = true;
                            break;
                        case 'query':
                            operations.push(operation);
                            abort = true;
                            break;
                    }

                    // if it was added, pop it
                    if (shouldPop) streams.in.buffer.shift();
                } while (batch.size() < batchSize && !abort);

                // commit as batch
                if (batch.size() > 0) {
                    const table = operations[0].table;
                    return new Promise((resolve, reject) => {
                        this.service.executeBatch(
                            table,
                            batch,
                            (error, result) => {
                                if (!error) {
                                    for (
                                        let i = 0;
                                        i < operations.length;
                                        i++
                                    ) {
                                        const opresult = result[i]; // TODO: make sure the results are always in order
                                        const operation = operations[i];
                                        if (!opresult.error) {
                                            if (isRetrieveBatch) {
                                                streams.out.push(
                                                    opresult.entity,
                                                    operations[0]
                                                );
                                                operation.resolve(
                                                    opresult.entity
                                                );
                                            } else {
                                                streams.out.emit(
                                                    'success',
                                                    opresult.response
                                                );
                                                operation.resolve(
                                                    opresult.response
                                                );
                                                operation.reject(
                                                    new Error('cry break')
                                                );
                                            }
                                        } else {
                                            streams.out.emit(
                                                'error',
                                                opresult.error
                                            );
                                            operation.reject(error);
                                        }
                                    }
                                    resolve(result);
                                } else {
                                    for (const operation of operations) {
                                        streams.out.emit(
                                            'error',
                                            operation,
                                            error
                                        );
                                        operation.reject('error', error);
                                        reject(error);
                                    }
                                }
                            }
                        );
                    });
                }

                // commit as operation
                if (operations.length === 1) {
                    const operation = operations[0];
                    return new Promise((resolve, reject) => {
                        return this.service.queryEntities(
                            operation.table,
                            operation.query || new azs.TableQuery(),
                            operation.token,
                            (error, result) => {
                                if (!error) {
                                    for (const entity of result.entries) {
                                        streams.out.push(entity, operations);
                                    }
                                    if (result.continuationToken) {
                                        operation.token =
                                            result.continuationToken;
                                        streams.in.buffer.push(operation);
                                    } else {
                                        operation.resolve();
                                    }
                                    resolve();
                                } else {
                                    streams.out.emit('error', error);
                                    operation.reject(error);
                                    reject(error);
                                }
                            }
                        );
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

    public query<In = AzureTableOperation, Out = any>(
        operations: In | In[],
        inOptions?: IStreamOptions<In, AzureTableOperation>,
        outOptions?: IStreamOptions<any, Out>
    ): ReadableStream<any, Out> {
        // start the stream
        const streams = this.queryStream<In, Out>(
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

    public queryAsync<In = AzureTableOperation, Out = any>(
        operations: In | In[],
        inOptions?: IStreamOptions<In, AzureTableOperation>,
        outOptions?: IStreamOptions<any, Out>
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                // start commit
                const stream = this.query(operations, inOptions, outOptions);

                // resolve when done
                stream.once('end', () => {
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /** A Promise that will return true if the table is not empty. */
    public hasEntities(table: string) {
        return new Promise<boolean>((resolve, reject) => {
            const query = new azs.TableQuery();
            this.service.queryEntities<any>(
                table,
                query,
                null,
                (error, result) => {
                    if (!error) {
                        resolve(result.entries.length > 0);
                    } else {
                        reject(error);
                    }
                }
            );
        });
    }

    /** A Promise to insert an entity into the specified table. */
    public insert(table: string, entity: object) {
        return new Promise<azs.TableService.EntityMetadata>(
            (resolve, reject) => {
                this.service.insertEntity(table, entity, (error, result) => {
                    if (!error) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });
            }
        );
    }

    /** A Promise to delete the specified table. */
    public async deleteTable(table: string) {
        return new Promise<azs.ServiceResponse>((resolve, reject) => {
            this.service.deleteTable(table, (error, response) => {
                if (!error) {
                    resolve(response);
                } else {
                    reject(error);
                }
            });
        });
    }

    /** A Promise to create the table if it doesn't exist. */
    public async createTableIfNotExists(table: string) {
        return new Promise<azs.TableService.TableResult>((resolve, reject) => {
            this.service.createTableIfNotExists(table, (error, result) => {
                if (!error) {
                    resolve(result);
                } else {
                    reject(error);
                }
            });
        });
    }
}
