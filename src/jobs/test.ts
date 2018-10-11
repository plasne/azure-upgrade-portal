// includes
import assert = require('assert');
import axios from 'axios';
import { ChildProcess, fork } from 'child_process';
import dotenv = require('dotenv');
import 'mocha';
import * as globalExt from '../lib/global-ext';
import { ICreateJob } from './Job';
import Jobs from './Jobs';

// before
let jobs: Jobs | undefined;
let server: ChildProcess | undefined;
let logcar: ChildProcess | undefined;
before(() => {
    // read variables
    dotenv.config();
    const LOG_LEVEL = process.env.LOG_LEVEL;
    globalExt.enableConsoleLogging(LOG_LEVEL || 'silly');
    const STORAGE_ACCOUNT = process.env.STORAGE_ACCOUNT;
    const STORAGE_KEY = process.env.STORAGE_KEY;
    if (!STORAGE_ACCOUNT || !STORAGE_KEY) {
        throw new Error(
            'You must have environmental variables set for STORAGE_ACCOUNT and STORAGE_KEY.'
        );
    }

    // create the Jobs context
    jobs = new Jobs(STORAGE_ACCOUNT, STORAGE_KEY);

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
        if (jobs) {
            await jobs.clear();
            const hasJobs = await jobs.hasJobs();
            assert.ok(hasJobs === false);
        } else {
            throw new Error(`Jobs context not created.`);
        }
    });

    it('should be able to create a job without tasks', async () => {
        if (server) {
            const job: ICreateJob = {};
            const response = await axios.post<any>(
                'http://localhost:8113/job',
                job
            );
            assert.ok(response.status >= 200 && response.status < 300);
            assert.ok(typeof response.data.id === 'string');
        } else {
            throw new Error(`Server does not exist.`);
        }
    });
});

// shutdown the API server
after(() => {
    globalExt.disablePersistentLogging();
    if (jobs) jobs.shutdown();
    if (logcar) logcar.kill();
    if (server) server.kill();
});
