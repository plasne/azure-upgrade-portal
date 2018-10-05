// includes
import * as azs from 'azure-storage';
import { v4 as uuid } from 'uuid';
import AzureTableOperation from '../lib/AzureTableOperation';
import PromiseImposter from '../lib/PromiseImposter';
import Jobs from './Jobs';
import Task, { ICreateTask } from './Task';

// definitions
export type JobStatus = 'unknown' | 'initializing';

// definition for creating a job
export interface ICreateJob {
    autoClose?: boolean;
    tasks?: ICreateTask[];
    queue?: string;
    message?: string;
}

export default class Job {
    public id: string;
    public status: JobStatus;
    public jobs: Jobs;

    constructor(jobs: Jobs) {
        this.id = uuid();
        this.status = 'unknown';
        this.jobs = jobs;
    }

    public close() {
        // support auto-close once all tasks are closed
    }

    public async create(definition: ICreateJob) {
        const promises: Array<PromiseImposter | Promise<any>> = [];

        // set properties
        this.status = 'initializing';

        // use a generator
        const generator = azs.TableUtilities.entityGenerator;

        // insert into table
        const top = new AzureTableOperation('jobs', 'insert', {
            PartitionKey: generator.String(this.id),
            RowKey: generator.String('root'),
            Status: generator.String(this.status)
        });
        promises.push(top);
        this.jobs.tableIn.push(top);

        // create each task
        if (definition.tasks) {
            for (const taskDefinition of definition.tasks) {
                const task = new Task(this, taskDefinition.name);
                const promise = task.create(taskDefinition);
                promises.push(promise);
            }
        }

        // wait for everything to be done
        await Promise.all(promises);
    }
}
