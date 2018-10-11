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
const azs = __importStar(require("azure-storage"));
const child_process_1 = require("child_process");
const dotenv = require("dotenv");
require("mocha");
const globalExt = __importStar(require("../lib/global-ext"));
// before
let server;
let logcar;
before(() => {
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
        const response = await axios_1.default.delete('http://localhost:8113/jobs');
        assert.ok(response.status >= 200 && response.status < 300);
        dotenv.config();
        const STORAGE_ACCOUNT = process.env.STORAGE_ACCOUNT;
        const STORAGE_KEY = process.env.STORAGE_KEY;
        if (!STORAGE_ACCOUNT || !STORAGE_KEY) {
            throw new Error('need STORAGE_ACCOUNT and STORAGE_KEY.');
        }
        const service = azs.createTableService(STORAGE_ACCOUNT, STORAGE_KEY);
        await new Promise((resolve, reject) => {
            service.queryEntities('jobs', new azs.TableQuery(), undefined, (error, result) => {
                if (!error) {
                    if (result.entries.length < 1) {
                        resolve();
                    }
                    else {
                        reject(new Error('objects were still found in the table.'));
                    }
                }
                else {
                    reject(error);
                }
            });
        });
    });
    it('should be able to create a job without tasks', async () => {
        const job = {};
        const create = await axios_1.default.post('http://localhost:8113/job', job);
        assert.ok(create.status >= 200 && create.status < 300);
        assert.ok(typeof create.data.id === 'string');
        const verify = await axios_1.default.get(`http://localhost:8113/job/${create.data.id}`);
        assert.ok(verify.status >= 200 && verify.status < 300);
        assert.ok(verify.data.tasks.length === 0);
    });
    it('should be able to create a job with tasks', async () => {
        const job = {
            tasks: [
                {
                    name: 'task1'
                },
                {
                    name: 'task2'
                }
            ]
        };
        const create = await axios_1.default.post('http://localhost:8113/job', job);
        const verify = await axios_1.default.get(`http://localhost:8113/job/${create.data.id}`);
        assert.ok(verify.status >= 200 && verify.status < 300);
        assert.ok(verify.data.tasks.length === 2);
    });
});
// shutdown the API server
after(() => {
    globalExt.disablePersistentLogging();
    if (logcar)
        logcar.kill();
    if (server)
        server.kill();
});
