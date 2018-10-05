"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// includes
// import PromisePool from 'es6-promise-pool';
const events_1 = require("events");
const overarg_1 = require("overarg");
class Stream extends events_1.EventEmitter {
    constructor(obj) {
        super();
        this.buffer = [];
        this.processing = [];
        this.isEnded = false;
        this.isReadable = false;
        // apply settings
        this.options = obj || {};
        // raise errors, but don't throw them
        this.on('error', () => {
            // prevents: https://nodejs.org/api/events.html#events_error_events
        });
        // wire up internal events
        this.on('end', () => {
            this.emit('close');
            this.isEnded = true;
        });
    }
    push(input, ...args) {
        // announce when there is data that can be read
        if (!this.isReadable) {
            this.isReadable = true;
            this.emit('readable');
        }
        // transform if a function was provided
        let output = input;
        if (this.options.transform) {
            output = this.options.transform(input);
        }
        // emit or push to buffer
        if (output) {
            // transform can return null to suppress
            if (this.listenerCount('data') > 0) {
                this.emit('data', output, ...args);
            }
            else {
                this.buffer.push(output);
            }
        }
        return output;
    }
    async process() {
        // get arguments
        const from = overarg_1.overarg('object', ...arguments) || this;
        const work = overarg_1.overarg('function', ...arguments);
        const concurrency = overarg_1.overarg('number', ...arguments) || 10;
        // get the next promise for processing
        const processNext = () => {
            // the concurrency limit has been reached
            if (this.processing.length >= concurrency)
                return true;
            // if the consumer canceled or ended, then no need to continue
            if (from !== this &&
                (this.state === 'canceled' || this.state === 'ended')) {
                return false;
            }
            // if the consumer paused, then wait for them to resume
            if (this.state === 'paused')
                return true;
            // a custom function will determine the work to do
            if (work) {
                const promise = work();
                if (promise)
                    return promise;
            }
            // if no more records are going to come, no need to continue
            //  NOTE: that if there are still things being processed, they could create children
            if (this.processing.length < 1 && from.state === 'ended') {
                return false;
            }
            // wait for more records
            return true;
        };
        // loop
        const loop = () => {
            try {
                const shouldContinue = processNext();
                if (typeof shouldContinue === 'boolean') {
                    if (this.processing.length < 1)
                        this.emit('idle');
                    return shouldContinue;
                }
                else {
                    // remove the promise on its completion making room for more
                    this.processing.push(shouldContinue);
                    shouldContinue.finally(() => {
                        const index = this.processing.indexOf(shouldContinue);
                        if (index > -1)
                            this.processing.splice(index, 1);
                    });
                    if (this.processing.length < 1)
                        this.emit('idle');
                    return loop(); // continue filling the processing immediately
                }
            }
            catch (error) {
                this.emit('error', error);
                return true;
            }
        };
        // respect processAfter
        if (from && from.options.processAfter)
            await from.options.processAfter;
        if (this.options.processAfter)
            await this.options.processAfter;
        // start processing
        await new Promise(resolve => {
            const interval = setInterval(() => {
                const shouldContinue = loop();
                if (!shouldContinue) {
                    clearInterval(interval);
                    resolve();
                }
            }, 10);
        });
        // wait for processing to finish
        await Promise.all(this.processing);
        if (!this.isEnded)
            this.emit('end');
    }
    pipe(stream, propogateEnd = true) {
        this.on('data', (data) => {
            stream.push(data);
        });
        if (propogateEnd) {
            this.once('end', () => {
                stream.emit('end');
            });
        }
    }
    waitForEnd() {
        return new Promise(resolve => {
            this.once('end', () => {
                resolve();
            });
        });
    }
    waitForIdle() {
        return new Promise(resolve => {
            this.once('idle', () => {
                resolve();
            });
        });
    }
}
exports.default = Stream;