"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// includes
const events_1 = require("events");
const overarg_1 = require("overarg");
const promise_timeout_1 = require("promise-timeout");
class Stream extends events_1.EventEmitter {
    constructor(obj) {
        super();
        this.buffer = [];
        this.processing = [];
        this.isEnded = false;
        this.isReadable = false;
        // apply settings
        this.options = obj || {};
        // if there is a handler (besides this one), then raise those messages
        //  into the stream, otherwise, throw them.
        this.on('error', error => {
            // prevents: https://nodejs.org/api/events.html#events_error_events
            if (this.listenerCount('error') === 1) {
                setTimeout(() => {
                    throw error;
                }, 0);
            }
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
        // respect processAfter
        if (from && from.options.processAfter)
            await from.options.processAfter;
        if (this.options.processAfter)
            await this.options.processAfter;
        // process loop
        await new Promise(resolve => {
            const loop = () => {
                try {
                    const shouldContinue = processNext();
                    if (typeof shouldContinue === 'boolean') {
                        if (this.processing.length < 1)
                            this.emit('idle');
                        if (shouldContinue) {
                            setTimeout(() => {
                                loop();
                            }, 10);
                        }
                        else {
                            resolve();
                        }
                    }
                    else {
                        // remove the promise on its completion making room for more
                        this.processing.push(shouldContinue);
                        const done = () => {
                            const index = this.processing.indexOf(shouldContinue);
                            if (index > -1)
                                this.processing.splice(index, 1);
                        };
                        // NOTE: removed finally() since that requires Node 10
                        // NOTE: don't let it sit in the processing queue for more than 5 minutes
                        promise_timeout_1.timeout(shouldContinue, 1000 * 60 * 5).then(done, done);
                        if (this.processing.length < 1)
                            this.emit('idle');
                        loop();
                    }
                }
                catch (error) {
                    setTimeout(() => {
                        loop();
                    }, 10);
                    throw error;
                }
            };
            loop();
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
    waitForEnd(ms) {
        return promise_timeout_1.timeout(new Promise(resolve => {
            this.once('end', () => {
                resolve();
            });
        }), ms);
    }
    waitForIdle(ms) {
        return promise_timeout_1.timeout(new Promise(resolve => {
            this.once('idle', () => {
                resolve();
            });
        }), ms);
    }
}
exports.default = Stream;
