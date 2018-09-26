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
require('dotenv').config();
const cmd = require("commander");
const winston = __importStar(require("winston"));
const express = require("express");
const app = express();
// define command line parameters
cmd.version(process.env.npm_package_version || 'unknown')
    .option('-l, --log-level <s>', 'LOG_LEVEL. The minimum level to log to the console (error, warn, info, verbose, debug, silly). Defaults to "info".', /^(error|warn|info|verbose|debug|silly)$/i)
    .option('-p, --port <i>', '[REQUIRED] PORT. The port that will host the portal.', parseInt)
    .parse(process.argv);
// globals
const LOG_LEVEL = cmd.logLevel || process.env.LOG_LEVEL || 'info';
const PORT = cmd.port || process.env.PORT || 8112;
// enable logging
const logColors = {
    error: '\x1b[31m',
    warn: '\x1b[33m',
    info: '',
    verbose: '\x1b[32m',
    debug: '\x1b[32m',
    silly: '\x1b[32m' // green
};
const transport = new winston.transports.Console({
    format: winston.format.combine(winston.format.timestamp(), winston.format.printf(event => {
        const color = logColors[event.level] || '';
        const level = event.level.padStart(7);
        return `${event.timestamp} ${color}${level}\x1b[0m: ${event.message}`;
    }))
});
const logger = winston.createLogger({
    level: LOG_LEVEL,
    transports: [transport]
});
// log startup
console.log(`LOG_LEVEL = "${LOG_LEVEL}".`);
logger.info(`PORT = "${PORT}".`);
// check requirements
if (!PORT)
    throw new Error('You must specify a PORT.');
// hello world
app.get('/', (_, res) => {
    res.send('Hello from portal\n');
});
// listening
app.listen(PORT, () => {
    logger.verbose(`listening on port ${PORT}...`);
});
