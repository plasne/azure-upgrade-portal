// includes
import assert = require('assert');
import axios from 'axios';
import { ChildProcess, fork } from 'child_process';
import dotenv = require('dotenv');
import 'mocha';
import * as globalExt from '../lib/global-ext';
import { IRemediate } from './controllers/remediate';

// before
let server: ChildProcess | undefined;
let logcar: ChildProcess | undefined;
before(() => {
    // read variables
    dotenv.config();
    const LOG_LEVEL = process.env.LOG_LEVEL;
    globalExt.enableConsoleLogging(LOG_LEVEL || 'silly');

    // startup the logcar
    const p1 = new Promise<ChildProcess>((resolve, reject) => {
        try {
            const forked = fork(`${__dirname}/../logcar/server.js`, [
                '--log-level',
                'verbose'
            ]).on('message', message => {
                if (message === 'listening') {
                    global.logger.info(
                        'LogCar listening on "logcar", connecting...'
                    );
                    resolve(forked);
                }
            });
        } catch (error) {
            reject(error);
        }
    }).then(cp => {
        logcar = cp;
    });

    // startup the API server
    const p2 = new Promise<ChildProcess>((resolve, reject) => {
        try {
            const forked = fork(`${__dirname}/server.js`, [
                '--port',
                '8112',
                '--log-level',
                'verbose'
            ]).on('message', message => {
                if (message === 'listening') {
                    global.logger.verbose(
                        'API server listening on port 8112...'
                    );
                    resolve(forked);
                }
            });
            global.logger.verbose('waiting for API server...');
        } catch (error) {
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
        const response = await axios.get<any>('http://localhost:8112');
        assert.ok(response.status >= 200 && response.status < 300);
        assert.ok(typeof response.data.application === 'string');
        assert.ok(typeof response.data.version === 'string');
    });

    it('should create a table entry', async () => {
        const rem: IRemediate = { when: 'now', scope: 'abc123' };
        const response = await axios.post<any>(
            'http://localhost:8112/remediate',
            rem
        );
        assert.ok(response.status >= 200 && response.status < 300);
        assert.ok(response.data.success);
    });
}).timeout(20000);

// shutdown the API server
after(() => {
    globalExt.disablePersistentLogging();
    if (logcar) logcar.kill();
    if (server) server.kill();
});
