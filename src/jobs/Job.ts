// includes
import * as azs from 'azure-storage';
import { timeout } from 'promise-timeout';
import { v4 as uuid } from 'uuid';
import AzureQueueOperation from '../lib/AzureQueueOperation';
import AzureTableOperation from '../lib/AzureTableOperation';
import PromiseImposter from '../lib/PromiseImposter';
import Jobs from './Jobs';
import Task, { ICreateTask } from './Task';

// definitions
export type JobStatus = 'unknown' | 'initializing' | 'closed';

// definition for creating a job
export interface ICreateJob {
    status?: JobStatus;
    autoClose?: boolean;
    tasks?: ICreateTask[];
    queue?: string;
    message?: string;
}

// definition for patching a job
export interface IPatchJob {
    id: string;
    status?: JobStatus;
    autoClose?: boolean;
    tasks?: ICreateTask[];
}

export default class Job {
    public jobs: Jobs;
    public id: string = '?';
    public status: JobStatus = 'unknown';
    public autoClose: boolean = false;
    public tasks: Task[] = [];

    constructor(jobs: Jobs, obj?: any) {
        this.jobs = jobs;
        if (typeof obj === 'object' && obj.RowKey._ === 'root') {
            this.load(obj);
        } else {
            this.id = uuid();
        }
    }

    public toJSON() {
        return {
            autoClose: this.autoClose,
            id: this.id,
            status: this.status,
            tasks: this.tasks.map(t => t.toJSON())
        };
    }

    public load(obj: any) {
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

    public close() {
        // support auto-close once all tasks are closed
    }

    public async patch(definition: IPatchJob) {
        const promises: Array<PromiseImposter | Promise<void>> = [];

        // patch the job properties
        let changed = false;
        if (
            definition.status !== undefined &&
            this.status !== definition.status
        ) {
            this.status = definition.status;
            changed = true;
        }
        if (
            definition.autoClose !== undefined &&
            this.autoClose !== definition.autoClose
        ) {
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
                } else {
                    task = new Task(this, patch.name);
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
            const top = new AzureTableOperation('jobs', 'replace', {
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

    public async create(definition: ICreateJob) {
        const promises: Array<PromiseImposter | Promise<any>> = [];

        // set properties
        this.status = definition.status || 'initializing';
        if (definition.autoClose) this.autoClose = definition.autoClose;

        // insert into table
        const generator = azs.TableUtilities.entityGenerator;
        const top = new AzureTableOperation('jobs', 'insert', {
            AutoClose: generator.Boolean(this.autoClose),
            PartitionKey: generator.String(this.id),
            RowKey: generator.String('root'),
            Status: generator.String(this.status)
        });
        promises.push(top);
        this.jobs.tableIn.push(top);

        // insert into queue
        if (definition.queue && definition.message) {
            const qop = new AzureQueueOperation(
                definition.queue,
                'enqueue',
                definition.message
            );
            promises.push(qop);
            this.jobs.queueIn.push(qop);
        }

        // create each task
        if (definition.tasks) {
            for (const taskDefinition of definition.tasks) {
                const task = new Task(this, taskDefinition.name);
                this.tasks.push(task);
                const promise = task.create(taskDefinition);
                promises.push(promise);
            }
        }

        // wait for everything to be done
        await timeout(Promise.all(promises), 1000 * 60 * 5); // 5 min max
    }
}
