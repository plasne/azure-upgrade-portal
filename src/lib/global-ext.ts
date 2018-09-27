// includes
import * as fs from 'fs';
import * as util from 'util';
import * as winston from 'winston';

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
export function enableLogging(logLevel: string) {
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
