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
    constructor(job, name) {
        this.name = name;
        this.job = job;
        this.status = 'unknown';
    }
    close() {
        // support auto-close once all tasks are closed
    }
    async create(definition) {
        const promises = [];
        // use a generator
        const generator = azs.TableUtilities.entityGenerator;
        // insert into table
        const top = new AzureTableOperation_1.default('jobs', 'insert', {
            PartitionKey: generator.String(this.job.id),
            RowKey: generator.String(this.name),
            Status: generator.String('initializing')
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
