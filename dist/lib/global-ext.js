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
const fs = __importStar(require("fs"));
const ipc = __importStar(require("node-ipc"));
const util = __importStar(require("util"));
const uuid_1 = require("uuid");
const winston = __importStar(require("winston"));
// promisify
const readFileAsync = util.promisify(fs.readFile);
// add version
global.version = async () => {
    try {
        const raw = await readFileAsync(`${process.cwd()}/package.json`, 'utf8');
        const pkg = JSON.parse(raw);
        return pkg.version;
    }
    catch (error) {
        global.logger.debug(`version could not be read from "${process.cwd()}/package.json".`);
        return 'unknown';
    }
};
// enable logging
function enableConsoleLogging(logLevel) {
    const logColors = {
        debug: '\x1b[32m',
        error: '\x1b[31m',
        info: '',
        silly: '\x1b[32m',
        verbose: '\x1b[32m',
        warn: '\x1b[33m' // yellow
    };
    const transport = new winston.transports.Console({
        format: winston.format.combine(winston.format.timestamp(), winston.format.printf(event => {
            const color = logColors[event.level] || '';
            const level = event.level.padStart(7);
            return `${event.timestamp} ${color}${level}\x1b[0m: ${event.message}`;
        }))
    });
    global.logger = winston.createLogger({
        level: logLevel,
        transports: [transport]
    });
}
exports.enableConsoleLogging = enableConsoleLogging;
// connect to IPC
async function connectToIpc(socketRoot, sourceName, targetName) {
    await new Promise(resolve => {
        ipc.config.id = sourceName;
        ipc.config.socketRoot = socketRoot;
        ipc.config.retry = 1500;
        ipc.config.stopRetrying = false;
        ipc.config.silent = true;
        ipc.connectTo(targetName, () => {
            ipc.of.logcar.on('connect', () => {
                global.logger.verbose(`"${sourceName}" successfully connected to "${targetName}" over IPC.`);
                resolve();
            });
        });
    });
}
// start persistent logging
async function enablePersistentLogging(socketRoot) {
    return connectToIpc(socketRoot, 'logcar-client', 'logcar');
}
exports.enablePersistentLogging = enablePersistentLogging;
// stop persistent logging
async function disablePersistentLogging() {
    ipc.disconnect('logcar');
}
exports.disablePersistentLogging = disablePersistentLogging;
// commit to the persistent log
global.commitLog = (level, message, jobId, taskName) => {
    return new Promise(async (resolve, reject) => {
        if (ipc.of.logcar) {
            // create the message
            const logEntry = {
                coorelationId: uuid_1.v4(),
                jobId,
                level,
                message,
                taskName
            };
            // commit the log and wait for response
            ipc.of.logcar.emit('log', logEntry);
            ipc.of.logcar.once('receipt', (msg) => {
                global.logger.verbose(`receipt from "logcar": ${JSON.stringify(msg)}`);
                resolve(msg);
            });
            ipc.of.logcar.once('failure', (msg) => {
                global.logger.error(`failure from "logcar".`);
                global.logger.error(msg.error.stack);
                reject(msg.error);
            });
        }
        else {
            reject(new Error('You must enablePersistentLogging() first.'));
        }
    });
};
