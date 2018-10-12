"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// includes
const azs = __importStar(require("azure-storage"));
const AzureQueueOperation_1 = __importDefault(require("../lib/AzureQueueOperation"));
const AzureTableOperation_1 = __importDefault(require("../lib/AzureTableOperation"));
class Task {
    constructor(job, nameOrObj) {
        this.name = '?';
        this.status = 'unknown';
        this.job = job;
        if (typeof nameOrObj === 'string') {
            this.name = nameOrObj;
        }
        else if (typeof nameOrObj === 'object' &&
            nameOrObj.RowKey._ !== 'root') {
            this.load(nameOrObj);
        }
        else {
            this.name = name;
        }
    }
    toJSON() {
        return {
            name: this.name,
            status: this.status
        };
    }
    load(obj) {
        if (obj.RowKey && obj.RowKey.hasOwnProperty('_')) {
            this.name = obj.RowKey._;
        }
        if (obj.Status && obj.Status.hasOwnProperty('_')) {
            this.status = obj.Status._;
        }
    }
    close() {
        // support auto-close once all tasks are closed
    }
    async patch(definition) {
        // patch the task properties
        let changed = false;
        if (definition.status !== undefined &&
            this.status !== definition.status) {
            this.status = definition.status;
            changed = true;
        }
        // record this patched object
        if (changed) {
            const generator = azs.TableUtilities.entityGenerator;
            const top = new AzureTableOperation_1.default('jobs', 'replace', {
                PartitionKey: generator.String(this.job.id),
                RowKey: generator.String(this.name),
                Status: generator.String(this.status)
            });
            this.job.jobs.tableIn.push(top);
            await top;
        }
    }
    async create(definition) {
        const promises = [];
        // set properties
        this.status = definition.status || 'initializing';
        // insert into table
        const generator = azs.TableUtilities.entityGenerator;
        const top = new AzureTableOperation_1.default('jobs', 'insert', {
            PartitionKey: generator.String(this.job.id),
            RowKey: generator.String(this.name),
            Status: generator.String(this.status)
        });
        promises.push(top);
        this.job.jobs.tableIn.push(top);
        // insert into queue
        if (definition.queue && definition.message) {
            const qop = new AzureQueueOperation_1.default(definition.queue, 'enqueue', definition.message);
            promises.push(qop);
            this.job.jobs.queueIn.push(qop);
        }
        // wait on everything to be done
        await Promise.all(promises);
    }
}
exports.default = Task;
