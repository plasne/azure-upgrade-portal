// includes
require('dotenv').config();
import cmd = require('commander');
import * as winston from 'winston';
import express = require('express');

const app = express();

// define command line parameters
cmd.version(process.env.npm_package_version || 'unknown')
    .option(
        '-l, --log-level <s>',
        'LOG_LEVEL. The minimum level to log to the console (error, warn, info, verbose, debug, silly). Defaults to "info".',
        /^(error|warn|info|verbose|debug|silly)$/i
    )
    .option(
        '-p, --port <i>',
        '[REQUIRED] PORT. The port that will host the portal.',
        parseInt
    )
    .parse(process.argv);

// globals
const LOG_LEVEL = cmd.logLevel || process.env.LOG_LEVEL || 'info';
const PORT = cmd.port || process.env.PORT || 8112;

// enable logging
const logColors: {
    [index: string]: string;
} = {
    error: '\x1b[31m', // red
    warn: '\x1b[33m', // yellow
    info: '', // white
    verbose: '\x1b[32m', // green
    debug: '\x1b[32m', // green
    silly: '\x1b[32m' // green
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
const logger = winston.createLogger({
    level: LOG_LEVEL,
    transports: [transport]
});

// log startup
console.log(`LOG_LEVEL = "${LOG_LEVEL}".`);
logger.info(`PORT = "${PORT}".`);

// check requirements
if (!PORT) throw new Error('You must specify a PORT.');

// hello world
app.get('/', (_, res) => {
    res.send('Hello from portal\n');
});

// listening
app.listen(PORT, () => {
    logger.verbose(`listening on port ${PORT}...`);
});
