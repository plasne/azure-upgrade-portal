// includes
import assert = require('assert');
import axios from 'axios';
import * as azs from 'azure-storage';
import { ChildProcess, fork } from 'child_process';
import dotenv = require('dotenv');
import 'mocha';
import * as globalExt from '../lib/global-ext';
import { ICreateJob, IFetchJob, IPatchJob } from './Job';

// before
let server: ChildProcess | undefined;
let logcar: ChildProcess | undefined;
before(() => {
    // read variables
    dotenv.config();
    const LOG_LEVEL = process.env.LOG_LEVEL;
    globalExt.enableConsoleLogging(LOG_LEVEL || 'silly');

    // startup the logcar
    const p1 = new Promise<ChildProcess>((resolve, reject) => {
        try {
            const forked = fork(`${__dirname}/../logcar/server.js`, [
                '--log-level',
                'verbose'
            ]).on('message', message => {
                if (message === 'listening') {
                    if (global.logger) {
                        global.logger.info(
                            'LogCar listening on "logcar", connecting...'
                        );
                    }
                    resolve(forked);
                }
            });
        } catch (error) {
            reject(error);
        }
    }).then(cp => {
        logcar = cp;
    });

    // startup the Jobs server
    const p2 = new Promise<ChildProcess>((resolve, reject) => {
        try {
            const forked = fork(`${__dirname}/server.js`, [
                '--port',
                '8113',
                '--log-level',
                'verbose'
            ]).on('message', message => {
                if (message === 'listening') {
                    if (global.logger) {
                        global.logger.verbose(
                            'Jobs server listening on port 8113...'
                        );
                    }
                    resolve(forked);
                }
            });
            if (global.logger) {
                global.logger.verbose('waiting for Jobs server...');
            }
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
        const create = await axios.post<{ id: string }>(
            'http://localhost:8113/job',
            job
        );
        assert.ok(
            typeof create.data.id === 'string',
            'create job id is of type "string".'
        );
        const verify = await axios.get<IFetchJob>(
            `http://localhost:8113/job/${create.data.id}`
        );
        assert.ok(verify.status >= 200 && verify.status < 300);
        assert.equal(
            typeof verify.data.id,
            'string',
            'job id is of type "string".'
        );
        assert.equal(verify.data.autoClose, false, 'job autoclose is "false".');
        assert.equal(
            verify.data.status,
            'initializing',
            'job status is "initializing".'
        );
        assert.equal(verify.data.tasks.length, 0, 'there are no tasks.');
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
        const create = await axios.post<{ id: string }>(
            'http://localhost:8113/job',
            job
        );
        const verify = await axios.get<IFetchJob>(
            `http://localhost:8113/job/${create.data.id}`
        );
        assert.equal(
            typeof verify.data.id,
            'string',
            'job id is of type "string".'
        );
        assert.equal(verify.data.autoClose, false, 'job autoClose is "false".');
        assert.equal(
            verify.data.status,
            'initializing',
            'job status is "initializing".'
        );
        assert.equal(verify.data.tasks.length, 2, 'there are 2 tasks');
        assert.equal(
            verify.data.tasks[0].name,
            'task1',
            'the 1st task is named "task1".'
        );
        assert.equal(
            verify.data.tasks[0].status,
            'initializing',
            'the 1st task status is "initializing".'
        );
        assert.equal(
            verify.data.tasks[1].name,
            'task2',
            'the 2nd task is named "task1".'
        );
        assert.equal(
            verify.data.tasks[1].status,
            'initializing',
            'the 2nd task status is "initializing".'
        );
    });

    it('should be able to change a job status or autoClose', async () => {
        const createJob: ICreateJob = {};
        const create = await axios.post<{ id: string }>(
            'http://localhost:8113/job',
            createJob
        );
        const before = await axios.get<IFetchJob>(
            `http://localhost:8113/job/${create.data.id}`
        );
        assert.equal(
            before.data.status,
            'initializing',
            `job "${create.data.id}" before status is "${
                before.data.status
            }" instead of "initializing".`
        );
        assert.equal(
            before.data.autoClose,
            false,
            `job "${create.data.id}" before autoClose is "${
                before.data.autoClose
            }" instead of "false".`
        );
        const patchJob: IPatchJob = {
            autoClose: true,
            id: create.data.id,
            status: 'closed'
        };
        await axios.patch<void>(`http://localhost:8113/job`, patchJob);
        const after = await axios.get<IFetchJob>(
            `http://localhost:8113/job/${create.data.id}`
        );
        assert.equal(
            after.data.status,
            'closed',
            `job "${create.data.id}" after status is "${
                after.data.status
            }" instead of "closed".`
        );
        assert.equal(
            after.data.autoClose,
            true,
            `job "${create.data.id}" after autoClose is "${
                after.data.autoClose
            }" instead of "true".`
        );
    });

    it('should be able to change a task status', async () => {
        const createJob: ICreateJob = {
            tasks: [{ name: 'task1' }]
        };
        const create = await axios.post<{ id: string }>(
            'http://localhost:8113/job',
            createJob
        );
        const before = await axios.get<IFetchJob>(
            `http://localhost:8113/job/${create.data.id}`
        );
        assert.equal(
            before.data.tasks[0].status,
            'initializing',
            `job "${create.data.id}" before task status is "${
                before.data.tasks[0].status
            }" instead of "initializing".`
        );
        const patchJob: IPatchJob = {
            id: create.data.id,
            tasks: [{ name: 'task1', status: 'closed' }]
        };
        await axios.patch<void>(`http://localhost:8113/job`, patchJob);
        const after = await axios.get<IFetchJob>(
            `http://localhost:8113/job/${create.data.id}`
        );
        assert.equal(
            after.data.tasks[0].status,
            'closed',
            `job "${create.data.id}" after task status is "${
                after.data.tasks[0].status
            }" instead of "closed".`
        );
    });

    it('should be able to autoclose', async () => {
        const createJob: ICreateJob = {
            autoClose: true,
            tasks: [{ name: 'task1' }, { name: 'task2' }]
        };
        const create = await axios.post<{ id: string }>(
            'http://localhost:8113/job',
            createJob
        );
        const before = await axios.get<IFetchJob>(
            `http://localhost:8113/job/${create.data.id}`
        );
        assert.equal(
            before.data.status,
            'initializing',
            `job "${create.data.id}" before status is "${
                before.data.tasks[0].status
            }" instead of "initializing".`
        );
        const patchJob: IPatchJob = {
            id: create.data.id,
            tasks: [
                { name: 'task1', status: 'closed' },
                { name: 'task2', status: 'closed' }
            ]
        };
        await axios.patch<void>(`http://localhost:8113/job`, patchJob);
        const after = await axios.get<IFetchJob>(
            `http://localhost:8113/job/${create.data.id}`
        );
        assert.equal(
            after.data.status,
            'closed',
            `job "${create.data.id}" after task status is "${
                after.data.status
            }" instead of "closed".`
        );
    });
});

// shutdown the API server
after(() => {
    globalExt.disablePersistentLogging();
    if (logcar) logcar.kill();
    if (server) server.kill();
});
