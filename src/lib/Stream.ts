// includes
// import PromisePool from 'es6-promise-pool';
import { EventEmitter } from 'events';
import { overarg } from 'overarg';

export type StreamTransform<T, U> = (obj: T, metadata?: any) => U | null;

export interface IStreamOptions<T, U> {
    transform?: StreamTransform<T, U>;
    maxBuffer?: number;
    batchSize?: number;
    processAfter?: Promise<any>;
}

export default abstract class Stream<T, U> extends EventEmitter {
    public options: IStreamOptions<T, U>;
    public buffer: U[] = [];
    public processing: Array<Promise<any>> = [];
    protected isEnded: boolean = false;
    protected isReadable: boolean = false;

    abstract get state(): string;

    constructor(obj?: IStreamOptions<T, U>) {
        super();

        // apply settings
        this.options = obj || {};

        // if there is a handler (besides this one), then raise those messages
        //  into the stream, otherwise, throw them.
        this.on('error', error => {
            // prevents: https://nodejs.org/api/events.html#events_error_events
            if (this.listenerCount('error') === 1) throw error;
        });

        // wire up internal events
        this.on('end', () => {
            this.emit('close');
            this.isEnded = true;
        });
    }

    public push(input: T, ...args: any[]) {
        // announce when there is data that can be read
        if (!this.isReadable) {
            this.isReadable = true;
            this.emit('readable');
        }

        // transform if a function was provided
        let output: U | null = input as any;
        if (this.options.transform) {
            output = this.options.transform(input);
        }

        // emit or push to buffer
        if (output) {
            // transform can return null to suppress
            if (this.listenerCount('data') > 0) {
                this.emit('data', output, ...args);
            } else {
                this.buffer.push(output);
            }
        }

        return output;
    }

    public async process(
        work: () => Promise<any> | null,
        concurrency?: number
    ): Promise<void>;

    public async process(
        from: Stream<any, any>,
        work: () => Promise<any> | null,
        concurrency?: number
    ): Promise<void>;

    public async process(): Promise<void> {
        // get arguments
        const from = overarg<Stream<any, any>>('object', ...arguments) || this;
        const work = overarg<() => Promise<any>>('function', ...arguments);
        const concurrency = overarg<number>('number', ...arguments) || 10;

        // get the next promise for processing
        const processNext = () => {
            // the concurrency limit has been reached
            if (this.processing.length >= concurrency) return true;

            // if the consumer canceled or ended, then no need to continue
            if (
                from !== this &&
                (this.state === 'canceled' || this.state === 'ended')
            ) {
                return false;
            }

            // if the consumer paused, then wait for them to resume
            if (this.state === 'paused') return true;

            // a custom function will determine the work to do
            if (work) {
                const promise = work();
                if (promise) return promise;
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
        if (from && from.options.processAfter) await from.options.processAfter;
        if (this.options.processAfter) await this.options.processAfter;

        // process loop
        await new Promise(resolve => {
            const loop: any = () => {
                try {
                    const shouldContinue = processNext();
                    if (typeof shouldContinue === 'boolean') {
                        if (this.processing.length < 1) this.emit('idle');
                        if (shouldContinue) {
                            setTimeout(() => {
                                loop();
                            }, 10);
                        } else {
                            resolve();
                        }
                    } else {
                        // remove the promise on its completion making room for more
                        this.processing.push(shouldContinue);
                        shouldContinue.finally(() => {
                            const index = this.processing.indexOf(
                                shouldContinue
                            );
                            if (index > -1) this.processing.splice(index, 1);
                        });
                        if (this.processing.length < 1) this.emit('idle');
                        loop();
                    }
                } catch (error) {
                    this.emit('error', error);
                    setTimeout(() => {
                        loop();
                    }, 10);
                }
            };
            loop();
        }).catch(error => {
            this.emit('error', error);
        });

        // wait for processing to finish
        await Promise.all(this.processing);
        if (!this.isEnded) this.emit('end');
    }

    public pipe(stream: Stream<U, any>, propogateEnd: boolean = true) {
        this.on('data', (data: U) => {
            stream.push(data);
        });
        if (propogateEnd) {
            this.once('end', () => {
                stream.emit('end');
            });
        }
    }

    public waitForEnd() {
        return new Promise<void>(resolve => {
            this.once('end', () => {
                resolve();
            });
        });
    }

    public waitForIdle() {
        return new Promise<void>(resolve => {
            this.once('idle', () => {
                resolve();
            });
        });
    }
}
