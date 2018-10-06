// includes
import assert = require('assert');
import axios from 'axios';
import { ChildProcess, fork } from 'child_process';
import 'mocha';

// unit tests
describe('API Unit Tests', () => {
    // startup the API server
    let server: ChildProcess | undefined;
    before(done => {
        server = fork(`${__dirname}/server.js`, ['--port', '8112']).on(
            'message',
            message => {
                if (message === 'listening') {
                    console.log('API server listening on port 8113...\n');
                    done();
                }
            }
        );
    });

    // test
    it('should respond with application/version', async () => {
        const response = await axios.get<any>('http://localhost:8112');
        assert.ok(response.status >= 200 && response.status < 300);
        assert.ok(response.data.application);
        assert.ok(response.data.version);
    });

    // shutdown the API server
    after(() => {
        if (server) server.kill();
    });
});
