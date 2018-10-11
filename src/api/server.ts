// includes
import { json as bodyParserJson } from 'body-parser';
import cmd = require('commander');
import dotenv = require('dotenv');
import express = require('express');
import * as fs from 'fs';
import * as os from 'os';
import * as util from 'util';
import * as globalExt from '../lib/global-ext';

// promisify
const readdirAsync = util.promisify(fs.readdir);

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
const PORT = cmd.port || process.env.PORT || 8112;
const SOCKET_ROOT = cmd.socketRoot || process.env.SOCKET_ROOT || '/tmp/';
global.STORAGE_ACCOUNT = cmd.storageAccount || process.env.STORAGE_ACCOUNT;
global.STORAGE_KEY = cmd.storageKey || process.env.STORAGE_KEY;

// enable logging
globalExt.enableConsoleLogging(LOG_LEVEL);

// declare startup
async function startup() {
    try {
        // log startup
        console.log(`LOG_LEVEL = "${LOG_LEVEL}".`);
        global.logger.verbose(`PORT = "${PORT}".`);
        global.logger.verbose(`SOCKET_ROOT = "${SOCKET_ROOT}"`);

        // check requirements
        if (!PORT) {
            throw new Error('You must specify a PORT.');
        }

        if (!global.STORAGE_ACCOUNT) {
            throw new Error('You must specify a STORAGE_ACCOUNT.');
        }
        if (!global.STORAGE_KEY) {
            throw new Error('You must specify a STORAGE_KEY.');
        }

        // start persistent logging
        global.logger.info(`Attempting to connect to "logcar"...`);
        await globalExt.enablePersistentLogging(SOCKET_ROOT);
        global.logger.info(`Connected to "logcar".`);
        await global.commitLog(
            'info',
            `API instance on "${os.hostname}" started up.`
        );

        // mount all routes
        const routePaths = await readdirAsync(`${__dirname}/routes`);
        for (const routePath of routePaths) {
            global.logger.verbose(`mounting routes for "${routePath}"...`);
            require(`${__dirname}/routes/${routePath}`)(app);
            global.logger.verbose(`mounted routes for "${routePath}".`);
        }

        // start listening
        app.listen(PORT, () => {
            global.logger.verbose(`listening on port ${PORT}...`);
            if (process.send) {
                global.logger.verbose('sent "listening" from API to test rig.');
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
