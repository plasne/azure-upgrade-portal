// includes
import * as azs from 'azure-storage';
import AzureQueueOperation from '../lib/AzureQueueOperation';
import AzureTableOperation from '../lib/AzureTableOperation';
import PromiseImposter from '../lib/PromiseImposter';
import Job from './Job';

// define the job types
export type TaskStatus = 'unknown' | 'initializing';

// definition for creating a job
export interface ICreateTask {
    name: string;
    queue?: string;
    message?: string;
}

export default class Task {
    public name: string;
    public job: Job;
    public status: TaskStatus;

    constructor(job: Job, name: string) {
        this.name = name;
        this.job = job;
        this.status = 'unknown';
    }

    public close() {
        // support auto-close once all tasks are closed
    }

    public async create(definition: ICreateTask) {
        const promises: PromiseImposter[] = [];

        // use a generator
        const generator = azs.TableUtilities.entityGenerator;

        // insert into table
        const top = new AzureTableOperation('jobs', 'insert', {
            PartitionKey: generator.String(this.job.id),
            RowKey: generator.String(this.name),
            Status: generator.String('initializing')
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
