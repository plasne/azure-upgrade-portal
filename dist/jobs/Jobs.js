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
const AzureQueue_1 = __importDefault(require("../lib/AzureQueue"));
const AzureTable_1 = __importDefault(require("../lib/AzureTable"));
const AzureTableOperation_1 = __importDefault(require("../lib/AzureTableOperation"));
const Job_1 = __importDefault(require("./Job"));
//  extends Array<Job>
class Jobs {
    constructor(account, key) {
        // create the table in & out streams
        this.azureTable = new AzureTable_1.default({ account, key });
        this.createJobsTable = this.azureTable.createTableIfNotExists('jobs');
        const tableStreams = this.azureTable.queryStream({
            processAfter: this.createJobsTable
        }, {
            batchSize: 100,
            transform: data => {
                const job = new Job_1.default(this);
                job.id = data.PartitionKey._;
                job.status = data.Status._;
                return job;
            }
        });
        this.tableIn = tableStreams.in.on('error', error => {
            global.logger.error(error.stack);
        });
        this.tableOut = tableStreams.out.on('error', error => {
            global.logger.error(error.stack);
        });
        // create the queue in & out streams
        this.azureQueue = new AzureQueue_1.default({ account, key });
        const queueStreams = this.azureQueue.queueStream();
        this.queueIn = queueStreams.in.on('error', error => {
            global.logger.error(error.stack);
        });
        this.queueOut = queueStreams.out.on('error', error => {
            global.logger.error(error.stack);
        });
    }
    shutdown() {
        this.tableIn.end();
        this.queueIn.end();
    }
    /** A Promise to pause activity on the jobs table, delete everything in it, and then resume. */
    async clear() {
        // pause the stream
        this.tableOut.pause();
        await this.tableOut.waitForIdle();
        // create a new stream for fast delete
        const table = new AzureTable_1.default({ service: this.azureTable.service });
        const streams = table.queryStream({
            processAfter: this.createJobsTable
        }, {
            batchSize: 100
        });
        streams.in.on('error', error => {
            global.logger.error(error.stack);
        });
        streams.out.on('error', error => {
            global.logger.error(error.stack);
        });
        // query for everything
        const query = new AzureTableOperation_1.default('jobs', 'query', new azs.TableQuery()).finally(() => {
            streams.in.end();
        });
        streams.in.push(query);
        // delete everything
        streams.out.on('data', data => {
            const del = new AzureTableOperation_1.default('jobs', 'delete', data);
            streams.in.push(del);
        });
        await streams.out.waitForEnd();
        // resume the jobs stream
        this.tableOut.resume();
    }
    /** A Promise to return true if there are any jobs in the table. */
    async hasJobs() {
        return this.azureTable.hasEntities('jobs');
    }
    async createJob(definition) {
        const job = new Job_1.default(this);
        await job.create(definition);
        return job;
    }
}
exports.default = Jobs;
