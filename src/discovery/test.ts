// includes
// import assert = require('assert');
import { ChildProcess, fork } from 'child_process';
import dotenv = require('dotenv');
import 'mocha';
import * as globalExt from '../lib/global-ext';
import Discovery from './Discovery';

// before
let logcar: ChildProcess | undefined;
let discovery: Discovery | undefined;
before(async () => {
    // read variables
    dotenv.config();
    const LOG_LEVEL = process.env.LOG_LEVEL;
    const APP_ID = process.env.APP_ID;
    const APP_KEY = process.env.APP_KEY;
    const DIRECTORY = process.env.DIRECTORY;
    const STORAGE_ACCOUNT = process.env.STORAGE_ACCOUNT;
    const STORAGE_KEY = process.env.STORAGE_KEY;
    globalExt.enableConsoleLogging(LOG_LEVEL || 'silly');

    // validate
    if (!APP_ID || !APP_KEY || !DIRECTORY || !STORAGE_ACCOUNT || !STORAGE_KEY) {
        throw new Error(
            'You must have environmental variables set for APP_ID, APP_KEY, DIRECTORY, STORAGE_ACCOUNT and STORAGE_KEY.'
        );
    }

    // initialize discovery
    discovery = new Discovery({
        appId: APP_ID,
        appKey: APP_KEY,
        directory: DIRECTORY,
        storageAcount: STORAGE_ACCOUNT,
        storageKey: STORAGE_KEY
    });

    // start listening for jobs
    discovery.listen();

    // startup the logcar
    return new Promise<ChildProcess>((resolve, reject) => {
        try {
            const forked = fork(`${__dirname}/../logcar/server.js`, [
                '--log-level',
                'verbose'
            ]).on('message', message => {
                if (message === 'listening') {
                    if (global.logger) {
                        global.logger.info(
                            'LogCar listening on "logcar", connecting...'
                        );
                    }
                    resolve(forked);
                }
            });
        } catch (error) {
            reject(error);
        }
    }).then(cp => {
        logcar = cp;
    });
});

// unit tests
describe('Discovery Unit Tests', () => {
    it('should clear previous test results', async () => {
        if (discovery) await discovery.clear(`test`);
    });
});

// shutdown the API server
after(() => {
    globalExt.disablePersistentLogging();
    if (logcar) logcar.kill();
    if (discovery) discovery.unlisten();
});
