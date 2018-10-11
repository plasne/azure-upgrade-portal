// includes
import { json as bodyParserJson } from 'body-parser';
import cmd = require('commander');
import dotenv = require('dotenv');
import express = require('express');
import * as http from 'http';
import * as https from 'https';
import * as os from 'os';
import * as globalExt from '../lib/global-ext';
import { ICreateJob } from './Job';
import Jobs from './Jobs';

// THIS SHOULD ALSO BE THE SCHEDULER

// configure express
const app = express();
app.use(bodyParserJson());

// define command line parameters
let doStartup = true;
cmd.option(
    '-l, --log-level <s>',
    `LOG_LEVEL. The minimum level to log (error, warn, info, verbose, debug, silly). Defaults to "info".`,
    /^(error|warn|info|verbose|debug|silly)$/i
)
    .option(
        '-p, --port <i>',
        '[REQUIRED] PORT. The port that will host the API.',
        parseInt
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
const PORT = cmd.port || process.env.PORT || 8113;
const STORAGE_ACCOUNT = cmd.storageAccount || process.env.STORAGE_ACCOUNT;
const STORAGE_KEY = cmd.storageKey || process.env.STORAGE_KEY;
const SOCKET_ROOT = cmd.socketRoot || process.env.SOCKET_ROOT || '/tmp/';

// modify the agents
const httpAgent: any = http.globalAgent;
httpAgent.keepAlive = true;
httpAgent.maxSockets = 30;
const httpsAgent: any = https.globalAgent;
httpsAgent.keepAlive = true;
httpsAgent.maxSockets = 30;

// enable logging
globalExt.enableConsoleLogging(LOG_LEVEL);

// declare startup
async function startup() {
    try {
        // log startup
        console.log(`LOG_LEVEL = "${LOG_LEVEL}".`);
        global.logger.verbose(`PORT = "${PORT}"`);
        global.logger.verbose(`STORAGE_ACCOUNT = "${STORAGE_ACCOUNT}"`);
        global.logger.verbose(`STORAGE_KEY = "${STORAGE_KEY}"`);
        global.logger.verbose(`SOCKET_ROOT = "${SOCKET_ROOT}"`);

        // check requirements
        if (!PORT) {
            throw new Error('You must specify a PORT.');
        }
        if (!STORAGE_ACCOUNT) {
            throw new Error('You must specify a STORAGE_ACCOUNT.');
        }
        if (!STORAGE_KEY) {
            throw new Error('You must specify a STORAGE_KEY.');
        }

        // start persistent logging
        global.logger.info(`Attempting to connect to "logcar"...`);
        await globalExt.enablePersistentLogging(SOCKET_ROOT);
        global.logger.info(`Connected to "logcar".`);
        await global.commitLog(
            'info',
            `Jobs instance on "${os.hostname}" started up.`
        );

        // initialize the jobs collection
        const jobs = new Jobs(STORAGE_ACCOUNT, STORAGE_KEY);

        // function to create a job
        app.post('/job', async (req, res) => {
            try {
                const definition: ICreateJob = req.body;
                const job = await jobs.createJob(definition);
                res.send({
                    id: job.id
                });
            } catch (error) {
                global.logger.error(error.stack);
                res.status(500).send(
                    'The job could not be created. Please check the logs.'
                );
            }
        });

        // start listening
        app.listen(PORT, () => {
            global.logger.info(`listening on port ${PORT}...`);
            if (process.send) {
                global.logger.verbose(
                    'sent "listening" from Jobs to test rig.'
                );
                process.send('listening');
            }
        });
    } catch (error) {
        global.logger.error(`Jobs startup() failed.`);
        global.logger.error(error);
        process.exit(1);
    }
}

// startup
if (doStartup) startup();
