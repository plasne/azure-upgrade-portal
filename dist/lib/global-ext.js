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
const util = __importStar(require("util"));
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
function enableLogging(logLevel) {
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
exports.enableLogging = enableLogging;
