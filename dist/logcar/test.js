"use strict";
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
const azs = __importStar(require("azure-storage"));
const child_process_1 = require("child_process");
const dotenv = require("dotenv");
require("mocha");
const ipc = __importStar(require("node-ipc"));
const uuid_1 = require("uuid");
const globalExt = __importStar(require("../lib/global-ext"));
// before
let logcar;
let service;
before(done => {
    // read variables
    dotenv.config();
    const LOG_LEVEL = process.env.LOG_LEVEL;
    globalExt.enableConsoleLogging(LOG_LEVEL || 'silly');
    const STORAGE_ACCOUNT = process.env.STORAGE_ACCOUNT;
    const STORAGE_KEY = process.env.STORAGE_KEY;
    if (!STORAGE_ACCOUNT || !STORAGE_KEY) {
        throw new Error('You must have environmental variables set for STORAGE_ACCOUNT and STORAGE_KEY.');
    }
    // connect to table
    service = azs.createBlobService(STORAGE_ACCOUNT, STORAGE_KEY);
    // startup the logcar
    logcar = child_process_1.fork(`${__dirname}/server.js`, ['--log-level', 'verbose']).on('message', message => {
        if (message === 'listening') {
            global.logger.info('LogCar listening on "logcar", connecting...\n');
            done();
        }
    });
});
// unit tests
describe('LogCar Tests', () => {
    it('should connect to a running logcar', async () => {
        await globalExt.enablePersistentLogging();
    });
    it('should delete all system messages', () => {
        return new Promise((resolve, reject) => {
            // create the message
            const entry = {
                coorelationId: uuid_1.v4()
            };
            ipc.of.logcar.emit('clear', entry);
            ipc.of.logcar.once('receipt', (msg) => {
                resolve(msg);
            });
            ipc.of.logcar.once('failure', (msg) => {
                reject(msg.error);
            });
        });
    });
    it('should log a system message', async () => {
        await global.commitLog('example system message');
        const blob = new Date().toISOString().split('T')[0] + '.txt';
        const content = await new Promise((resolve, reject) => {
            service.getBlobToText('logs', blob, (error, result) => {
                if (!error) {
                    resolve(result);
                }
                else {
                    reject(error);
                }
            });
        });
        assert.ok(content === 'example system message');
    });
    it('should log a job message without a task', async () => {
        const jobId = uuid_1.v4();
        await global.commitLog('example system message', jobId);
        const blob = `${jobId}.txt`;
        const content = await new Promise((resolve, reject) => {
            service.getBlobToText('logs', blob, (error, result) => {
                if (!error) {
                    resolve(result);
                }
                else {
                    reject(error);
                }
            });
        });
        assert.ok(content === 'example system message');
    });
    it('should log a job/task message', async () => {
        const jobId = uuid_1.v4();
        const taskId = uuid_1.v4();
        await global.commitLog('example system message', jobId, taskId);
        const blob = `${jobId}.${taskId}.txt`;
        const content = await new Promise((resolve, reject) => {
            service.getBlobToText('logs', blob, (error, result) => {
                if (!error) {
                    resolve(result);
                }
                else {
                    reject(error);
                }
            });
        });
        assert.ok(content === 'example system message');
    });
});
// shutdown the API server
after(() => {
    globalExt.disablePersistentLogging();
    if (logcar)
        logcar.kill();
});
