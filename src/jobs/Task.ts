// includes
import * as azs from 'azure-storage';
import {
    AzureQueueOperation,
    AzureTableOperation,
    PromiseImposter
} from 'azure-storage-stream';
import Job from './Job';

// define the job types
export type TaskStatus = 'unknown' | 'initializing' | 'closed';

// definition for fetching a task
export interface IFetchTask {
    name: string;
    status: TaskStatus;
}

// definition for creating a task
export interface ICreateTask {
    name: string;
    status?: TaskStatus;
    queue?: string;
    message?: string;
}

export default class Task {
    public job: Job;
    public name: string = '?';
    public status: TaskStatus = 'unknown';

    constructor(job: Job, nameOrObj: any) {
        this.job = job;
        if (typeof nameOrObj === 'string') {
            this.name = nameOrObj;
        } else if (
            typeof nameOrObj === 'object' &&
            nameOrObj.RowKey._ !== 'root'
        ) {
            this.load(nameOrObj);
        } else {
            this.name = name;
        }
    }

    public toJSON() {
        return {
            name: this.name,
            status: this.status
        } as IFetchTask;
    }

    public load(obj: any) {
        if (obj.RowKey && obj.RowKey.hasOwnProperty('_')) {
            this.name = obj.RowKey._;
        }
        if (obj.Status && obj.Status.hasOwnProperty('_')) {
            this.status = obj.Status._;
        }
    }

    public close() {
        // support auto-close once all tasks are closed
    }

    public async patch(definition: ICreateTask) {
        // patch the task properties
        let changed = false;
        if (
            definition.status !== undefined &&
            this.status !== definition.status
        ) {
            this.status = definition.status;
            changed = true;
        }

        // record this patched object
        if (changed) {
            const generator = azs.TableUtilities.entityGenerator;
            const top = new AzureTableOperation('jobs', 'replace', {
                PartitionKey: generator.String(this.job.id),
                RowKey: generator.String(this.name),
                Status: generator.String(this.status)
            });
            this.job.jobs.tableIn.push(top);
            await top;
        }
    }

    public async create(definition: ICreateTask) {
        const promises: PromiseImposter[] = [];

        // set properties
        this.status = definition.status || 'initializing';

        // insert into table
        const generator = azs.TableUtilities.entityGenerator;
        const top = new AzureTableOperation('jobs', 'insert', {
            PartitionKey: generator.String(this.job.id),
            RowKey: generator.String(this.name),
            Status: generator.String(this.status)
        });
        promises.push(top);
        this.job.jobs.tableIn.push(top);

        // insert into queue
        if (definition.queue && definition.message) {
            const qop = new AzureQueueOperation(
                definition.queue,
                'enqueue',
                definition.message
            );
            promises.push(qop);
            this.job.jobs.queueIn.push(qop);
        }

        // wait on everything to be done
        await Promise.all(promises);
    }
}
