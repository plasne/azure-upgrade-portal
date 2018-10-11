"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// includes
const assert = require("assert");
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process");
const dotenv = require("dotenv");
require("mocha");
const globalExt = __importStar(require("../lib/global-ext"));
const Jobs_1 = __importDefault(require("./Jobs"));
// before
let jobs;
let server;
let logcar;
before(() => {
    // read variables
    dotenv.config();
    const LOG_LEVEL = process.env.LOG_LEVEL;
    globalExt.enableConsoleLogging(LOG_LEVEL || 'silly');
    const STORAGE_ACCOUNT = process.env.STORAGE_ACCOUNT;
    const STORAGE_KEY = process.env.STORAGE_KEY;
    if (!STORAGE_ACCOUNT || !STORAGE_KEY) {
        throw new Error('You must have environmental variables set for STORAGE_ACCOUNT and STORAGE_KEY.');
    }
    // create the Jobs context
    jobs = new Jobs_1.default(STORAGE_ACCOUNT, STORAGE_KEY);
    // startup the logcar
    const p1 = new Promise((resolve, reject) => {
        try {
            const forked = child_process_1.fork(`${__dirname}/../logcar/server.js`, [
                '--log-level',
                'verbose'
            ]).on('message', message => {
                if (message === 'listening') {
                    global.logger.info('LogCar listening on "logcar", connecting...');
                    resolve(forked);
                }
            });
        }
        catch (error) {
            reject(error);
        }
    }).then(cp => {
        logcar = cp;
    });
    // startup the API server
    const p2 = new Promise((resolve, reject) => {
        try {
            const forked = child_process_1.fork(`${__dirname}/server.js`, [
                '--port',
                '8113',
                '--log-level',
                'verbose'
            ]).on('message', message => {
                if (message === 'listening') {
                    global.logger.verbose('Jobs server listening on port 8113...');
                    resolve(forked);
                }
            });
            global.logger.verbose('waiting for Jobs server...');
        }
        catch (error) {
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
        }
        else {
            throw new Error(`Jobs context not created.`);
        }
    });
    it('should be able to create a job without tasks', async () => {
        if (server) {
            const job = {};
            const response = await axios_1.default.post('http://localhost:8113/job', job);
            assert.ok(response.status >= 200 && response.status < 300);
            assert.ok(typeof response.data.id === 'string');
        }
        else {
            throw new Error(`Server does not exist.`);
        }
    });
});
// shutdown the API server
after(() => {
    globalExt.disablePersistentLogging();
    if (jobs)
        jobs.shutdown();
    if (logcar)
        logcar.kill();
    if (server)
        server.kill();
});
