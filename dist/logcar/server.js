"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// includes
const azs = __importStar(require("azure-storage"));
const cmd = require("commander");
const dotenv = require("dotenv");
const ipc = __importStar(require("node-ipc"));
const globalExt = __importStar(require("../lib/global-ext"));
// define command line parameters
cmd.option('-l, --log-level <s>', `LOG_LEVEL. The minimum level to log (error, warn, info, verbose, debug, silly). Defaults to "info".`, /^(error|warn|info|verbose|debug|silly)$/i)
    .option('-s, --storage-account <s>', '[REQUIRED] STORAGE_ACCOUNT. The Azure Storage Account that will be used for persistence.')
    .option('-k, --storage-key <s>', '[REQUIRED] STORAGE_KEY. The key for the Azure Storage Account that will be used for persistence.')
    .parse(process.argv);
// globals
dotenv.config();
const LOG_LEVEL = cmd.logLevel || process.env.LOG_LEVEL || 'info';
const STORAGE_ACCOUNT = cmd.storageAccount || process.env.STORAGE_ACCOUNT;
const STORAGE_KEY = cmd.storageKey || process.env.STORAGE_KEY;
// connect to the blob service
const service = azs.createBlobService(STORAGE_ACCOUNT, STORAGE_KEY);
// enable logging
globalExt.enableConsoleLogging(LOG_LEVEL);
function identify(entry) {
    if (entry.jobId && entry.taskName) {
        return `${entry.jobId}.${entry.taskName}.txt`;
    }
    else if (entry.jobId) {
        return `${entry.jobId}.txt`;
    }
    else {
        const now = new Date();
        return now.toISOString().split('T')[0] + '.txt';
    }
}
// define the write function
function write(entry) {
    // determine the blob name
    const blob = identify(entry);
    // optimistically write
    return new Promise((resolve, reject) => {
        const message = entry.message || '';
        console.log(`message: ${message}`);
        service.appendBlockFromText('logs', blob, message, error1 => {
            if (!error1) {
                resolve();
            }
            else {
                service.createAppendBlobFromText('logs', blob, message, error2 => {
                    if (!error2) {
                        resolve();
                    }
                    else {
                        reject(error2);
                    }
                });
            }
        });
    });
}
// define the clear function
function clear(entry) {
    // determine the blob name
    const blob = identify(entry);
    // delete
    return new Promise((resolve, reject) => {
        service.deleteBlobIfExists('logs', blob, error => {
            if (!error) {
                resolve();
            }
            else {
                reject(error);
            }
        });
    });
}
// define startup
async function startup() {
    try {
        // create the container
        await new Promise(resolve => {
            service.createContainerIfNotExists('logs', error => {
                if (!error) {
                    resolve();
                }
                else {
                    global.logger.error(`"logs" container could not be created.`);
                    process.exit(1);
                }
            });
        });
        // startup IPC server
        ipc.config.id = 'logcar';
        ipc.config.retry = 1500;
        ipc.config.silent = true;
        ipc.serve(() => {
            if (process.send) {
                global.logger.info('sent "listening" from LogCar to test rig.');
                process.send('listening');
            }
            else {
                global.logger.verbose(`listening on ${ipc.config.id}...`);
            }
            // listening for logs
            ipc.server.on('log', async (message, socket) => {
                try {
                    await write(message);
                    ipc.server.emit(socket, 'receipt', {
                        id: message.coorelationId
                    });
                }
                catch (error) {
                    ipc.server.emit(socket, 'failure', {
                        error,
                        id: message && message.coorelationId
                            ? message.coorelationId
                            : undefined
                    });
                }
            });
            // listening for clear
            ipc.server.on('clear', async (message, socket) => {
                try {
                    await clear(message);
                    ipc.server.emit(socket, 'receipt', {
                        if: message.coorelationId
                    });
                }
                catch (error) {
                    ipc.server.emit(socket, 'failure', {
                        error,
                        id: message && message.coorelationId
                            ? message.coorelationId
                            : undefined
                    });
                }
            });
        });
        ipc.server.start();
    }
    catch (error) {
        global.logger.error(`"logcar" startup() failed.`);
        global.logger.error(error);
        // try again every 20 seconds
        setTimeout(() => {
            startup();
        }, 20000);
    }
}
// startup
startup();