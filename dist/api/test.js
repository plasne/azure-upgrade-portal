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
// before
let server;
let logcar;
before(() => {
    // read variables
    dotenv.config();
    const LOG_LEVEL = process.env.LOG_LEVEL;
    globalExt.enableConsoleLogging(LOG_LEVEL || 'silly');
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
                '8112',
                '--log-level',
                'verbose'
            ]).on('message', message => {
                if (message === 'listening') {
                    global.logger.verbose('API server listening on port 8112...');
                    resolve(forked);
                }
            });
            global.logger.verbose('waiting for API server...');
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
describe('API Unit Tests', () => {
    it('should respond with application/version', async () => {
        const response = await axios_1.default.get('http://localhost:8112');
        assert.ok(response.status >= 200 && response.status < 300);
        assert.ok(typeof response.data.application === 'string');
        assert.ok(typeof response.data.version === 'string');
    });
    it('should create a table entry', async () => {
        const rem = { when: 'now', scope: 'abc123' };
        const response = await axios_1.default.post('http://localhost:8112/remediate', rem);
        assert.ok(response.status >= 200 && response.status < 300);
        assert.ok(response.data.success);
    });
}).timeout(20000);
// shutdown the API server
after(() => {
    globalExt.disablePersistentLogging();
    if (logcar)
        logcar.kill();
    if (server)
        server.kill();
});
