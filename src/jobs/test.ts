// includes
import assert = require('assert');
import axios from 'axios';
import * as azs from 'azure-storage';
import { ChildProcess, fork } from 'child_process';
import dotenv = require('dotenv');
import 'mocha';
import * as globalExt from '../lib/global-ext';
import { ICreateJob } from './Job';

// before
let server: ChildProcess | undefined;
let logcar: ChildProcess | undefined;
before(() => {
    // startup the logcar
    const p1 = new Promise<ChildProcess>((resolve, reject) => {
        try {
            const forked = fork(`${__dirname}/../logcar/server.js`, [
                '--log-level',
                'verbose'
            ]).on('message', message => {
                if (message === 'listening') {
                    global.logger.info(
                        'LogCar listening on "logcar", connecting...'
                    );
                    resolve(forked);
                }
            });
        } catch (error) {
            reject(error);
        }
    }).then(cp => {
        logcar = cp;
    });

    // startup the API server
    const p2 = new Promise<ChildProcess>((resolve, reject) => {
        try {
            const forked = fork(`${__dirname}/server.js`, [
                '--port',
                '8113',
                '--log-level',
                'verbose'
            ]).on('message', message => {
                if (message === 'listening') {
                    global.logger.verbose(
                        'Jobs server listening on port 8113...'
                    );
                    resolve(forked);
                }
            });
            global.logger.verbose('waiting for Jobs server...');
        } catch (error) {
            reject(error);
        }
    }).then(cp => {
        server = cp;
    });

    // wait for both
    return Promise.all([p1, p2]);
});

// unit tests
describe('Jobs Unit Tests', () => {
    it('should delete all jobs', async () => {
        const response = await axios.delete('http://localhost:8113/jobs');
        assert.ok(response.status >= 200 && response.status < 300);
        dotenv.config();
        const STORAGE_ACCOUNT = process.env.STORAGE_ACCOUNT;
        const STORAGE_KEY = process.env.STORAGE_KEY;
        if (!STORAGE_ACCOUNT || !STORAGE_KEY) {
            throw new Error('need STORAGE_ACCOUNT and STORAGE_KEY.');
        }
        const service = azs.createTableService(STORAGE_ACCOUNT, STORAGE_KEY);
        await new Promise((resolve, reject) => {
            service.queryEntities(
                'jobs',
                new azs.TableQuery(),
                undefined,
                (error, result) => {
                    if (!error) {
                        if (result.entries.length < 1) {
                            resolve();
                        } else {
                            reject(
                                new Error(
                                    'objects were still found in the table.'
                                )
                            );
                        }
                    } else {
                        reject(error);
                    }
                }
            );
        });
    });

    it('should be able to create a job without tasks', async () => {
        const job: ICreateJob = {};
        const create = await axios.post<any>('http://localhost:8113/job', job);
        assert.ok(create.status >= 200 && create.status < 300);
        assert.ok(typeof create.data.id === 'string');
        const verify = await axios.get<any>(
            `http://localhost:8113/job/${create.data.id}`
        );
        assert.ok(verify.status >= 200 && verify.status < 300);
        assert.ok(verify.data.tasks.length === 0);
    });

    it('should be able to create a job with tasks', async () => {
        const job: ICreateJob = {
            tasks: [
                {
                    name: 'task1'
                },
                {
                    name: 'task2'
                }
            ]
        };
        const create = await axios.post<any>('http://localhost:8113/job', job);
        const verify = await axios.get<any>(
            `http://localhost:8113/job/${create.data.id}`
        );
        assert.ok(verify.status >= 200 && verify.status < 300);
        assert.ok(verify.data.tasks.length === 2);
    });
});

// shutdown the API server
after(() => {
    globalExt.disablePersistentLogging();
    if (logcar) logcar.kill();
    if (server) server.kill();
});
