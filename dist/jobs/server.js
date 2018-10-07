"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// includes
const body_parser_1 = require("body-parser");
const cmd = require("commander");
const dotenv = require("dotenv");
const express = require("express");
const globalExt = __importStar(require("../lib/global-ext"));
const Jobs_1 = __importDefault(require("./Jobs"));
// THIS SHOULD ALSO BE THE SCHEDULER
// configure express
const app = express();
app.use(body_parser_1.json());
// define command line parameters
let doStartup = true;
cmd.option('-l, --log-level <s>', `LOG_LEVEL. The minimum level to log (error, warn, info, verbose, debug, silly). Defaults to "info".`, /^(error|warn|info|verbose|debug|silly)$/i)
    .option('-p, --port <i>', '[REQUIRED] PORT. The port that will host the API.', parseInt)
    .option('-s, --storage-account <s>', '[REQUIRED] STORAGE_ACCOUNT. The Azure Storage Account that will be used for persistence.')
    .option('-k, --storage-key <s>', '[REQUIRED] STORAGE_KEY. The key for the Azure Storage Account that will be used for persistence.')
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
// enable logging
globalExt.enableLogging(LOG_LEVEL);
// startup
if (doStartup) {
    // log startup
    console.log(`LOG_LEVEL = "${LOG_LEVEL}".`);
    global.logger.verbose(`PORT = "${PORT}"`);
    global.logger.verbose(`STORAGE_ACCOUNT = "${STORAGE_ACCOUNT}"`);
    global.logger.verbose(`STORAGE_KEY = "${STORAGE_KEY}"`);
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
    // initialize the jobs collection
    const jobs = new Jobs_1.default(STORAGE_ACCOUNT, STORAGE_KEY);
    // create a job
    app.post('/job', async (req, res) => {
        try {
            const definition = req.body;
            const job = await jobs.createJob(definition);
            res.send({
                id: job.id
            });
        }
        catch (error) {
            console.log(`EEEEEEEERRRRRRRROOOORRR`);
            global.logger.error(error.stack);
            res.status(500).send('The job could not be created. Please check the logs.');
        }
    });
    // start listening
    app.listen(PORT, () => {
        global.logger.verbose(`listening on port ${PORT}...`);
        if (process.send) {
            console.log('sent "listening" from Jobs to test rig.');
            process.send('listening');
        }
    });
}
