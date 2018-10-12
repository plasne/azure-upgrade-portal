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
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const os = __importStar(require("os"));
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
    .option('-r, --socket-root <s>', '[REQUIRED] SOCKET_ROOT. The root directory that will be used for sockets.')
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
const httpAgent = http.globalAgent;
httpAgent.keepAlive = true;
httpAgent.maxSockets = 30;
const httpsAgent = https.globalAgent;
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
        await global.commitLog('info', `Jobs instance on "${os.hostname}" started up.`);
        // initialize the jobs collection
        const jobs = new Jobs_1.default(STORAGE_ACCOUNT, STORAGE_KEY);
        // function to clear jobs
        app.delete('/jobs', async (_, res) => {
            try {
                await jobs.clear();
                res.status(200).end();
            }
            catch (error) {
                global.logger.error(error.stack);
                res.status(500).send('Jobs could not be deleted. Please check the logs.');
            }
        });
        // function to load a job
        app.get('/job/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const job = await jobs.loadJob(id);
                if (job) {
                    res.status(200).send(job.toJSON());
                }
                else {
                    res.status(404).end();
                }
            }
            catch (error) {
                global.logger.error(error.stack);
                res.status(500).send('The job could not be fetched. Please check the logs.');
            }
        });
        // function to create a job
        app.post('/job', async (req, res) => {
            try {
                const definition = req.body;
                const job = await jobs.createJob(definition);
                res.send({
                    id: job.id
                });
            }
            catch (error) {
                global.logger.error(error.stack);
                res.status(500).send('The job could not be created. Please check the logs.');
            }
        });
        // function to patch a job
        app.patch('/job', async (req, res) => {
            try {
                const definition = req.body;
                const job = await jobs.loadJob(definition.id);
                if (job) {
                    await job.patch(definition);
                    res.status(200).end();
                }
                else {
                    res.status(404).end();
                }
            }
            catch (error) {
                global.logger.error(error.stack);
                res.status(500).send('The job could not be patched. Please check the logs.');
            }
        });
        // start listening
        app.listen(PORT, () => {
            global.logger.info(`listening on port ${PORT}...`);
            if (process.send) {
                global.logger.verbose('sent "listening" from Jobs to test rig.');
                process.send('listening');
            }
        });
    }
    catch (error) {
        global.logger.error(`Jobs startup() failed.`);
        global.logger.error(error);
        process.exit(1);
    }
}
// startup
if (doStartup)
    startup();
