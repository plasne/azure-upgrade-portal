"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// includes
const assert = require("assert");
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process");
const dotenv = require("dotenv");
require("mocha");
const Jobs_1 = __importDefault(require("./Jobs"));
// startup the Jobs server
let server;
let jobs;
before(done => {
    // startup the server
    server = child_process_1.fork(`${__dirname}/server.js`, ['--port', '8113']).on('message', message => {
        if (message === 'listening') {
            console.log('Jobs server listening on port 8113...\n');
            done();
        }
    });
    // create the Jobs context
    dotenv.config();
    const STORAGE_ACCOUNT = process.env.STORAGE_ACCOUNT;
    const STORAGE_KEY = process.env.STORAGE_KEY;
    if (!STORAGE_ACCOUNT || !STORAGE_KEY) {
        throw new Error('You must have environmental variables set for STORAGE_ACCOUNT and STORAGE_KEY.');
    }
    jobs = new Jobs_1.default(STORAGE_ACCOUNT, STORAGE_KEY);
});
// unit tests
describe('Jobs Unit Tests', () => {
    it('should delete the jobs container', async () => {
        if (jobs) {
            await jobs.clear();
            const hasJobs = await jobs.hasJobs();
            assert.ok(hasJobs === false);
        }
        else {
            throw new Error(`Jobs context not created.`);
        }
    });
    it('should be able to create a job without tasks', async () => {
        const job = {};
        const response = await axios_1.default.post('http://localhost:8113/job', job);
        assert.ok(response.status >= 200 && response.status < 300);
        assert.ok(typeof response.data.id === 'string');
    });
});
// shutdown the API server
after(() => {
    if (jobs)
        jobs.shutdown();
    if (server)
        server.kill();
});
