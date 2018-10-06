"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PromiseImposter_1 = __importDefault(require("./PromiseImposter"));
class AzureTableOperation extends PromiseImposter_1.default {
    get partitionKey() {
        if (this.entity)
            return this.entity.PartitionKey;
        return undefined;
    }
    get rowKey() {
        if (this.entity)
            return this.entity.RowKey;
        return undefined;
    }
    constructor(table, type) {
        super();
        this.table = table;
        this.type = type;
        switch (type) {
            case 'query':
                this.query = arguments[2];
                break;
            case 'retrieve':
                this.entity = arguments[2];
                if (!this.entity ||
                    !this.entity.PartitionKey ||
                    !this.entity.RowKey) {
                    throw new Error('you must provide both a PartitionKey and RowKey.');
                }
                break;
            default:
                this.entity = arguments[2];
                break;
        }
    }
}
exports.default = AzureTableOperation;
