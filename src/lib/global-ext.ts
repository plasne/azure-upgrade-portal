// includes
import * as fs from 'fs';
import * as ipc from 'node-ipc';
import * as util from 'util';
import { v4 as uuid } from 'uuid';
import * as winston from 'winston';
import { ILogEntry } from '../logcar/server';

// promisify
const readFileAsync = util.promisify(fs.readFile);

// add version
global.version = async () => {
    try {
        const raw = await readFileAsync(
            `${process.cwd()}/package.json`,
            'utf8'
        );
        const pkg = JSON.parse(raw);
        return pkg.version;
    } catch (error) {
        global.logger.debug(
            `version could not be read from "${process.cwd()}/package.json".`
        );
        return 'unknown';
    }
};

// enable logging
export function enableConsoleLogging(logLevel: string) {
    const logColors: {
        [index: string]: string;
    } = {
        debug: '\x1b[32m', // green
        error: '\x1b[31m', // red
        info: '', // white
        silly: '\x1b[32m', // green
        verbose: '\x1b[32m', // green
        warn: '\x1b[33m' // yellow
    };
    const transport = new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(event => {
                const color = logColors[event.level] || '';
                const level = event.level.padStart(7);
                return `${event.timestamp} ${color}${level}\x1b[0m: ${
                    event.message
                }`;
            })
        )
    });
    global.logger = winston.createLogger({
        level: logLevel,
        transports: [transport]
    });
}

// connect to IPC
async function connectToIpc(
    socketRoot: string,
    sourceName: string,
    targetName: string
) {
    await new Promise(resolve => {
        ipc.config.id = sourceName;
        ipc.config.socketRoot = socketRoot;
        ipc.config.retry = 1500;
        ipc.config.stopRetrying = false;
        ipc.config.silent = true;
        ipc.connectTo(targetName, () => {
            ipc.of.logcar.on('connect', () => {
                global.logger.verbose(
                    `"${sourceName}" successfully connected to "${targetName}" over IPC.`
                );
                resolve();
            });
        });
    });
}

// start persistent logging
export async function enablePersistentLogging(socketRoot: string) {
    return connectToIpc(socketRoot, 'logcar-client', 'logcar');
}

// stop persistent logging
export async function disablePersistentLogging() {
    ipc.disconnect('logcar');
}

// commit to the persistent log
global.commitLog = (message: string, jobId?: string, taskName?: string) => {
    return new Promise<void>(async (resolve, reject) => {
        if (ipc.of.logcar) {
            // create the message
            const logEntry: ILogEntry = {
                coorelationId: uuid(),
                jobId,
                message,
                taskName
            };

            // commit the log and wait for response
            ipc.of.logcar.emit('log', logEntry);
            ipc.of.logcar.once('receipt', (msg: any) => {
                global.logger.verbose(
                    `receipt from "logcar": ${JSON.stringify(msg)}`
                );
                resolve(msg);
            });
            ipc.of.logcar.once('failure', (msg: any) => {
                global.logger.error(`failure from "logcar".`);
                global.logger.error(msg.error.stack);
                reject(msg.error);
            });
        } else {
            reject(new Error('You must enablePersistentLogging() first.'));
        }
    });
};
