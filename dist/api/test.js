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
before(done => {
    // read variables
    dotenv.config();
    const LOG_LEVEL = process.env.LOG_LEVEL;
    globalExt.enableLogging(LOG_LEVEL || 'silly');
    // startup the API server
    server = child_process_1.fork(`${__dirname}/server.js`, [
        '--port',
        '8112',
        '--log-level',
        'verbose'
    ]).on('message', message => {
        if (message === 'listening') {
            console.log('API server listening on port 8112...\n');
            done();
        }
    });
    console.log('waiting for API server...');
});
// unit tests
describe('API Unit Tests', () => {
    it('should respond with application/version', async () => {
        const response = await axios_1.default.get('http://localhost:8112');
        assert.ok(response.status >= 200 && response.status < 300);
        assert.ok(response.data.application);
        assert.ok(response.data.version);
    });
}).timeout(20000);
// shutdown the API server
after(() => {
    if (server)
        server.kill();
});
