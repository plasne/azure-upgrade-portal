import * as azs from 'azure-storage';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { ICreateJob } from '../../jobs/Job';
import Jobs from '../../jobs/Jobs';

export interface IRemediate {
    when: string;
    scope: string;
    options?: object;
}

export interface ITableEntity {
    PartitionKey?: string;
    RowKey?: string;
    [key: string]: string | number | boolean | undefined;
}

class RemediateTable {
    public static async Create(name: string): Promise<RemediateTable> {
        const rt = new RemediateTable();
        rt.name = name;
        await rt.CreateIfNotExists();
        return rt;
    }

    private svc: azs.TableService;
    private name: string = 'remediation';
    private constructor() {
        this.svc = azs.createTableService(
            global.STORAGE_ACCOUNT,
            global.STORAGE_KEY
        );
    }

    public async AddTask(record: ITableEntity) {
        return new Promise<void>((resolve, reject) => {
            try {
                const tr = this.createTask(record);
                this.svc.insertOrMergeEntity(this.name, tr, err => {
                    if (err) throw err;
                    resolve();
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    private createTask(entity: ITableEntity) {
        const result: any = {};
        Object.keys(entity).forEach(k => {
            const prop = Object.getOwnPropertyDescriptor(entity, k);
            if (prop) {
                result[
                    k
                ] = new azs.TableUtilities.entityGenerator.EntityProperty(
                    prop.value
                );
            }
        });
        return result;
    }

    private async CreateIfNotExists(): Promise<azs.TableService.TableResult> {
        return new Promise((resolve, reject) => {
            try {
                this.svc.createTableIfNotExists(this.name, (err, result) => {
                    if (err) throw err;
                    resolve(result);
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}

export default {
    /** Creates a remediation request */
    create: async (req: Request, res: Response, job: ICreateJob) => {
        const body: IRemediate = req.body;

        try {
            const bwhen = body.when;
            const bscope = body.scope;
            const bopt = JSON.stringify(body.options);
            const table = 'remediate';

            // validate body contents
            if (!bwhen || !bscope) {
                if (global.logger) {
                    global.logger.error(
                        'Incomplete JSON body: ' + JSON.stringify(req.body)
                    );
                }
                res.status(400).send(
                    'Remdiation request could not be completed.  Incomplete JSON body.'
                );
                return;
            }

            // generate a unique row key
            const id = uuid();

            const storage = await RemediateTable.Create(table);
            await storage.AddTask({
                PartitionKey: 'remediate',
                RowKey: id,
                options: bopt,
                scope: bscope,
                when: bwhen
            });
            if (global.logger) global.logger.info('Remediation record added.');

            // send to job engine to queue to run
            const jobs = new Jobs(global.STORAGE_ACCOUNT, global.STORAGE_KEY);
            await jobs.createJob(job);

            res.status(200).send();
        } catch (error) {
            if (global.logger) global.logger.error(error.stack);
            res.status(500).send(
                'The remediation request could not be created. Please check the logs.'
            );
        }
    }
};
