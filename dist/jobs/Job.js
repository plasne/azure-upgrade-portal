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
const AzureQueueOperation_1 = __importDefault(require("../lib/AzureQueueOperation"));
const AzureTableOperation_1 = __importDefault(require("../lib/AzureTableOperation"));
const Task_1 = __importDefault(require("./Task"));
class Job {
    constructor(jobs, obj) {
        this.id = '?';
        this.status = 'unknown';
        this.autoClose = false;
        this.tasks = [];
        this.jobs = jobs;
        if (typeof obj === 'object' && obj.RowKey._ === 'root') {
            this.load(obj);
        }
        else {
            this.id = uuid_1.v4();
        }
    }
    toJSON() {
        return {
            autoClose: this.autoClose,
            id: this.id,
            status: this.status,
            tasks: this.tasks.map(t => t.toJSON())
        };
    }
    load(obj) {
        if (obj.PartitionKey && obj.PartitionKey.hasOwnProperty('_')) {
            this.id = obj.PartitionKey._;
        }
        if (obj.Status && obj.Status.hasOwnProperty('_')) {
            this.status = obj.Status._;
        }
        if (obj.AutoClose && obj.AutoClose.hasOwnProperty('_')) {
            this.autoClose = obj.AutoClose._;
        }
    }
    close() {
        // support auto-close once all tasks are closed
    }
    async patch(definition) {
        const promises = [];
        // patch the job properties
        let changed = false;
        if (definition.status !== undefined &&
            this.status !== definition.status) {
            this.status = definition.status;
            changed = true;
        }
        if (definition.autoClose !== undefined &&
            this.autoClose !== definition.autoClose) {
            this.autoClose = definition.autoClose;
            changed = true;
        }
        // patch the tasks
        if (definition.tasks) {
            for (const patch of definition.tasks) {
                let task = this.tasks.find(t => t.name === patch.name);
                if (task) {
                    if (patch) {
                        promises.push(task.patch(patch));
                    }
                }
                else {
                    task = new Task_1.default(this, patch.name);
                    task.create(patch);
                    this.tasks.push(task);
                }
            }
        }
        // if the job status is not closed, there are tasks, and they are all NOT OPEN, close the job
        const open = this.tasks.find(t => t.status !== 'closed');
        if (this.status !== 'closed' && this.tasks.length > 0 && !open) {
            this.status = 'closed';
            changed = true;
        }
        // record this patched object
        if (changed) {
            const generator = azs.TableUtilities.entityGenerator;
            const top = new AzureTableOperation_1.default('jobs', 'replace', {
                AutoClose: generator.Boolean(this.autoClose),
                PartitionKey: generator.String(this.id),
                RowKey: generator.String('root'),
                Status: generator.String(this.status)
            });
            promises.push(top);
            this.jobs.tableIn.push(top);
        }
        // wait on all write operations
        await Promise.all(promises);
    }
    async create(definition) {
        const promises = [];
        // set properties
        this.status = definition.status || 'initializing';
        if (definition.autoClose)
            this.autoClose = definition.autoClose;
        // insert into table
        const generator = azs.TableUtilities.entityGenerator;
        const top = new AzureTableOperation_1.default('jobs', 'insert', {
            AutoClose: generator.Boolean(this.autoClose),
            PartitionKey: generator.String(this.id),
            RowKey: generator.String('root'),
            Status: generator.String(this.status)
        });
        promises.push(top);
        this.jobs.tableIn.push(top);
        // insert into queue
        if (definition.queue && definition.message) {
            const qop = new AzureQueueOperation_1.default(definition.queue, 'enqueue', definition.message);
            promises.push(qop);
            this.jobs.queueIn.push(qop);
        }
        // create each task
        if (definition.tasks) {
            for (const taskDefinition of definition.tasks) {
                const task = new Task_1.default(this, taskDefinition.name);
                this.tasks.push(task);
                const promise = task.create(taskDefinition);
                promises.push(promise);
            }
        }
        // wait for everything to be done
        await promise_timeout_1.timeout(Promise.all(promises), 1000 * 60 * 5); // 5 min max
    }
}
exports.default = Job;
