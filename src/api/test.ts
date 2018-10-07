// includes
import assert = require('assert');
import axios from 'axios';
import { ChildProcess, fork } from 'child_process';
import dotenv = require('dotenv');
import 'mocha';
import * as globalExt from '../lib/global-ext';

// before
let server: ChildProcess | undefined;
before(done => {
    // read variables
    dotenv.config();
    const LOG_LEVEL = process.env.LOG_LEVEL;
    globalExt.enableLogging(LOG_LEVEL || 'silly');

    // startup the API server
    server = fork(`${__dirname}/server.js`, [
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
        const response = await axios.get<any>('http://localhost:8112');
        assert.ok(response.status >= 200 && response.status < 300);
        assert.ok(response.data.application);
        assert.ok(response.data.version);
    });
}).timeout(20000);

// shutdown the API server
after(() => {
    if (server) server.kill();
});
