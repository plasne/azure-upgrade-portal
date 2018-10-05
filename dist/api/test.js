"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// includes
const assert = require("assert");
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process");
require("mocha");
// startup the API server
let server;
before(done => {
    server = child_process_1.fork(`${__dirname}/server.js`, ['--port', '8112']).on('message', message => {
        if (message === 'listening') {
            console.log('API server listening on port 8113...\n');
            done();
        }
    });
});
// unit tests
describe('API Unit Tests', () => {
    it('should respond with application/version', async () => {
        const response = await axios_1.default.get('http://localhost:8112');
        assert.ok(response.status >= 200 && response.status < 300);
        assert.ok(response.data.application);
        assert.ok(response.data.version);
    });
});
// shutdown the API server
after(() => {
    if (server)
        server.kill();
});
