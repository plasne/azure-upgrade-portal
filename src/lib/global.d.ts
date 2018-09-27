// includes
import * as winston from 'winston';

// add to global
declare global {
    namespace NodeJS {
        interface Global {
            version: () => Promise<string>;
            logger: winston.Logger;
        }
    }
}
