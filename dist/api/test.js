"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// includes
const axios_1 = __importDefault(require("axios"));
const assert = require("assert");
const child_process_1 = require("child_process");
require("mocha");
// startup the API server
const server = child_process_1.fork(`${__dirname}/server.js`, ['--port', '8113']);
before(done => {
    server.on('message', message => {
        if (message === 'listening') {
            console.log('\n');
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
    server.kill();
});