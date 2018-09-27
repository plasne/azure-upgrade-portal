// includes
import assert = require('assert');
import axios from 'axios';
import { fork } from 'child_process';
import 'mocha';

// startup the API server
const server = fork(`${__dirname}/server.js`, ['--port', '8112']);
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
        const response = await axios.get<any>('http://localhost:8112');
        assert.ok(response.status >= 200 && response.status < 300);
        assert.ok(response.data.application);
        assert.ok(response.data.version);
    });
});

// shutdown the API server
after(() => {
    server.kill();
});
