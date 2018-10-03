// includes
import cmd = require('commander');
import dotenv = require('dotenv');
import * as globalExt from '../lib/global-ext';

// define command line parameters
// let doStartup = true;
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
    .option('-V, --version', 'Displays the version.')
    .on('option:version', async () => {
        // doStartup = false;
        console.log(await global.version());
        process.exit(0);
    })
    .parse(process.argv);

// globals
dotenv.config();
const LOG_LEVEL = cmd.logLevel || process.env.LOG_LEVEL || 'info';
const STORAGE_ACCOUNT = cmd.storageAccount || process.env.STORAGE_ACCOUNT;
const STORAGE_KEY = cmd.storageKey || process.env.STORAGE_KEY;

// enable logging
globalExt.enableLogging(LOG_LEVEL);

// log the variables
global.logger.verbose(`STORAGE_ACCOUNT = "${STORAGE_ACCOUNT}"`);
global.logger.verbose(`STORAGE_KEY = "${STORAGE_KEY}"`);
