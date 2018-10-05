// includes
import assert = require('assert');
import axios from 'axios';
import { ChildProcess, fork } from 'child_process';
import dotenv = require('dotenv');
import 'mocha';
import { ICreateJob } from './Job';
import Jobs from './Jobs';

// create the Jobs context
dotenv.config();
const STORAGE_ACCOUNT = process.env.STORAGE_ACCOUNT;
const STORAGE_KEY = process.env.STORAGE_KEY;
if (!STORAGE_ACCOUNT || !STORAGE_KEY) {
    throw new Error(
        'You must have environmental variables set for STORAGE_ACCOUNT and STORAGE_KEY.'
    );
}
const jobs = new Jobs(STORAGE_ACCOUNT, STORAGE_KEY);

// startup the Jobs server
let server: ChildProcess | undefined;
before(done => {
    server = fork(`${__dirname}/server.js`, ['--port', '8113']).on(
        'message',
        message => {
            if (message === 'listening') {
                console.log('Jobs server listening on port 8113...\n');
                done();
            }
        }
    );
});

// unit tests
describe('Jobs Unit Tests', () => {
    it('should delete the jobs container', async () => {
        await jobs.clear();
        const hasJobs = await jobs.hasJobs();
        assert.ok(hasJobs === false);
    });

    it('should be able to create a job without tasks', async () => {
        const job: ICreateJob = {};
        const response = await axios.post<any>(
            'http://localhost:8113/job',
            job
        );
        assert.ok(response.status >= 200 && response.status < 300);
        assert.ok(typeof response.data.id === 'string');
    });
});

// shutdown the API server
after(() => {
    jobs.shutdown();
    if (server) server.kill();
});
