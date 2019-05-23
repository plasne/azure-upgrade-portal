// includes
import { AzureQueueOperation } from 'azure-storage-stream';
import cmd = require('commander');
import dotenv = require('dotenv');
import * as http from 'http';
import * as https from 'https';
import * as os from 'os';
import * as globalExt from '../lib/global-ext';
import Discovery, { IDiscoveryJob } from './Discovery';

// define command line parameters
let doStartup = true;
cmd.option(
    '-l, --log-level <s>',
    `LOG_LEVEL. The minimum level to log (error, warn, info, verbose, debug, silly). Defaults to "info".`,
    /^(error|warn|info|verbose|debug|silly)$/i
)
    .option(
        '-s, --storage-account <s>',
        '[REQUIRED] STORAGE_ACCOUNT. The Azure Storage Account that will be used for persistence.'
    )
    .option(
        '-k, --storage-key <s>',
        '[REQUIRED] STORAGE_KEY. The key for the Azure Storage Account that will be used for persistence.'
    )
    .option(
        '-d, --directory <s>',
        '[REQUIRED] DIRECTORY. The Azure AD directory that contains the APP_ID.'
    )
    .option(
        '-i, --app-id <s>',
        '[REQUIRED] APP_ID. The ID of the application that has permission to Azure AD.'
    )
    .option(
        '-l, --app-key <s>',
        '[REQUIRED] APP_KEY. The Azure Storage Account that will be used for persistence.'
    )
    .option(
        '-r, --socket-root <s>',
        '[REQUIRED] SOCKET_ROOT. The root directory that will be used for sockets.'
    )
    .option('-V, --version', 'Displays the version.')
    .on('option:version', async () => {
        doStartup = false;
        console.log(await global.version());
        process.exit(0);
    })
    .parse(process.argv);

// globals
dotenv.config();
const LOG_LEVEL = cmd.logLevel || process.env.LOG_LEVEL || 'info';
const STORAGE_ACCOUNT = cmd.storageAccount || process.env.STORAGE_ACCOUNT;
const STORAGE_KEY = cmd.storageKey || process.env.STORAGE_KEY;
const DIRECTORY = cmd.directory || process.env.DIRECTORY;
const APP_ID = cmd.appId || process.env.APP_ID;
const APP_KEY = cmd.appKey || process.env.APP_KEY;
const SOCKET_ROOT = cmd.socketRoot || process.env.SOCKET_ROOT || '/tmp/';

// modify the agents
const httpAgent: any = http.globalAgent;
httpAgent.keepAlive = true;
httpAgent.maxSockets = 30;
const httpsAgent: any = https.globalAgent;
httpsAgent.keepAlive = true;
httpsAgent.maxSockets = 30;

// declare startup
async function startup() {
    try {
        // enable logging
        globalExt.enableConsoleLogging(LOG_LEVEL);

        // log startup
        console.log(`LOG_LEVEL = "${LOG_LEVEL}".`);
        if (global.logger) {
            global.logger.verbose(`STORAGE_ACCOUNT = "${STORAGE_ACCOUNT}"`);
            global.logger.verbose(`STORAGE_KEY = "${STORAGE_KEY}"`);
            global.logger.verbose(`DIRECTORY = "${DIRECTORY}"`);
            global.logger.verbose(`APP_ID = "${APP_ID}"`);
            global.logger.verbose(`APP_KEY = "${APP_KEY}"`);
            global.logger.verbose(`SOCKET_ROOT = "${SOCKET_ROOT}"`);
        }

        // check requirements
        if (!STORAGE_ACCOUNT) {
            throw new Error('You must specify a STORAGE_ACCOUNT.');
        }
        if (!STORAGE_KEY) {
            throw new Error('You must specify a STORAGE_KEY.');
        }
        if (!DIRECTORY) {
            throw new Error('You must specify a DIRECTORY.');
        }
        if (!APP_ID) {
            throw new Error('You must specify a APP_ID.');
        }
        if (!APP_KEY) {
            throw new Error('You must specify a APP_KEY.');
        }

        // start persistent logging
        if (global.logger) {
            global.logger.info(`Attempting to connect to "logcar"...`);
        }
        await globalExt.enablePersistentLogging(SOCKET_ROOT);
        if (global.logger) global.logger.info(`Connected to "logcar".`);
        if (global.writer) {
            await global.writer(
                'info',
                `Discovery instance on "${os.hostname}" started.`
            );
        }

        // initialize discovery
        const discovery = new Discovery({
            appId: APP_ID,
            appKey: APP_KEY,
            directory: DIRECTORY,
            storageAcount: STORAGE_ACCOUNT,
            storageKey: STORAGE_KEY
        });

        // start listening for jobs
        discovery.listen();

        // TEST: insert a message
        const msg: IDiscoveryJob = {
            jobId: new Date().toISOString(),
            operation: 'start'
        };
        const top = new AzureQueueOperation('discovery', 'enqueue', msg);
        if (discovery.inQueue) discovery.inQueue.push(top);
    } catch (error) {
        if (global.logger) {
            global.logger.error(`Discovery startup() loop failed...`);
            global.logger.error(error);
        }
        try {
            if (global.writer) {
                await global.writer(
                    'error',
                    `Discovery instance on "${
                        os.hostname
                    }" failed in the startup() loop...`
                );
                await global.writer('error', error);
            }
        } catch (error) {
            // depending on the error persistent logging might not be possible
        }
        process.exit(1);
    }
}

// startup
if (doStartup) startup();
