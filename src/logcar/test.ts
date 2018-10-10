// includes
import assert = require('assert');
import * as azs from 'azure-storage';
import { ChildProcess, fork } from 'child_process';
import dotenv = require('dotenv');
import 'mocha';
import * as ipc from 'node-ipc';
import { v4 as uuid } from 'uuid';
import * as globalExt from '../lib/global-ext';
import { ILogEntry } from '../logcar/server';

// before
let logcar: ChildProcess | undefined;
let service: azs.BlobService;
let SOCKET_ROOT: string = '/tmp/';
before(done => {
    // read variables
    dotenv.config();
    const LOG_LEVEL = process.env.LOG_LEVEL;
    globalExt.enableConsoleLogging(LOG_LEVEL || 'silly');
    const STORAGE_ACCOUNT = process.env.STORAGE_ACCOUNT;
    const STORAGE_KEY = process.env.STORAGE_KEY;
    if (process.env.SOCKET_ROOT) SOCKET_ROOT = process.env.SOCKET_ROOT;
    if (!STORAGE_ACCOUNT || !STORAGE_KEY) {
        throw new Error(
            'You must have environmental variables set for STORAGE_ACCOUNT and STORAGE_KEY.'
        );
    }

    // connect to table
    service = azs.createBlobService(STORAGE_ACCOUNT, STORAGE_KEY);

    // startup the logcar
    logcar = fork(`${__dirname}/server.js`, ['--log-level', 'verbose']).on(
        'message',
        message => {
            if (message === 'listening') {
                global.logger.info(
                    'LogCar listening on "logcar", connecting...\n'
                );
                done();
            }
        }
    );
});

// unit tests
describe('LogCar Tests', () => {
    it('should connect to a running logcar', async () => {
        await globalExt.enablePersistentLogging(SOCKET_ROOT);
    });

    it('should delete all system messages', () => {
        return new Promise((resolve, reject) => {
            // create the message
            const entry: ILogEntry = {
                coorelationId: uuid()
            };
            ipc.of.logcar.emit('clear', entry);
            ipc.of.logcar.once('receipt', (msg: any) => {
                resolve(msg);
            });
            ipc.of.logcar.once('failure', (msg: any) => {
                reject(msg.error);
            });
        });
    });

    it('should log a system message', async () => {
        await global.commitLog('example system message');
        const blob = new Date().toISOString().split('T')[0] + '.txt';
        const content: string = await new Promise<string>((resolve, reject) => {
            service.getBlobToText('logs', blob, (error, result) => {
                if (!error) {
                    resolve(result);
                } else {
                    reject(error);
                }
            });
        });
        assert.ok(content === 'example system message');
    });

    it('should log a job message without a task', async () => {
        const jobId = uuid();
        await global.commitLog('example system message', jobId);
        const blob = `${jobId}.txt`;
        const content: string = await new Promise<string>((resolve, reject) => {
            service.getBlobToText('logs', blob, (error, result) => {
                if (!error) {
                    resolve(result);
                } else {
                    reject(error);
                }
            });
        });
        assert.ok(content === 'example system message');
    });

    it('should log a job/task message', async () => {
        const jobId = uuid();
        const taskId = uuid();
        await global.commitLog('example system message', jobId, taskId);
        const blob = `${jobId}.${taskId}.txt`;
        const content: string = await new Promise<string>((resolve, reject) => {
            service.getBlobToText('logs', blob, (error, result) => {
                if (!error) {
                    resolve(result);
                } else {
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
    if (logcar) logcar.kill();
});
