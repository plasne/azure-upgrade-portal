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
const promise_timeout_1 = require("promise-timeout");
const uuid_1 = require("uuid");
const AzureTableOperation_1 = __importDefault(require("../lib/AzureTableOperation"));
const Task_1 = __importDefault(require("./Task"));
class Job {
    constructor(jobs) {
        this.id = uuid_1.v4();
        this.status = 'unknown';
        this.jobs = jobs;
    }
    close() {
        // support auto-close once all tasks are closed
    }
    async create(definition) {
        const promises = [];
        // set properties
        this.status = 'initializing';
        // use a generator
        const generator = azs.TableUtilities.entityGenerator;
        // insert into table
        const top = new AzureTableOperation_1.default('jobs', 'insert', {
            PartitionKey: generator.String(this.id),
            RowKey: generator.String('root'),
            Status: generator.String(this.status)
        });
        promises.push(top);
        this.jobs.tableIn.push(top);
        // create each task
        if (definition.tasks) {
            for (const taskDefinition of definition.tasks) {
                const task = new Task_1.default(this, taskDefinition.name);
                const promise = task.create(taskDefinition);
                promises.push(promise);
            }
        }
        // wait for everything to be done
        await promise_timeout_1.timeout(Promise.all(promises), 1000 * 60 * 5); // 5 min max
    }
}
exports.default = Job;
