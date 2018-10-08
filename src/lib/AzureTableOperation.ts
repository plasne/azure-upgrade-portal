// includes
import * as azs from 'azure-storage';
import PromiseImposter from './PromiseImposter';

type operationTypes =
    | 'delete'
    | 'insert'
    | 'insertOrMerge'
    | 'insertOrReplace'
    | 'merge'
    | 'replace'
    | 'retrieve'
    | 'query';

export default class AzureTableOperation extends PromiseImposter {
    public table: string;
    public type: operationTypes;
    public entity?: any;
    public query?: azs.TableQuery;
    public token?: azs.TableService.TableContinuationToken;

    public get partitionKey() {
        if (this.entity) return this.entity.PartitionKey;
        return undefined;
    }

    public get rowKey() {
        if (this.entity) return this.entity.RowKey;
        return undefined;
    }

    /**
     * This class designates an table operation that can be queued, streamed, etc.
     * After creating an object, you may be alerted when its operation is complete using .then(),
     * .finally(), and trap errors with .catch().
     */
    constructor(table: string, type: operationTypes, entity: any);

    constructor(table: string, type: 'query', query: azs.TableQuery);

    constructor(table: string, type: operationTypes) {
        super();
        this.table = table;
        this.type = type;
        switch (type) {
            case 'query':
                this.query = arguments[2];
                break;
            case 'retrieve':
                this.entity = arguments[2];
                if (
                    !this.entity ||
                    !this.entity.PartitionKey ||
                    !this.entity.RowKey
                ) {
                    throw new Error(
                        'you must provide both a PartitionKey and RowKey.'
                    );
                }
                break;
            default:
                this.entity = arguments[2];
                break;
        }
    }
}
