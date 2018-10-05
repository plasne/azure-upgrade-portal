// includes
import Stream, { IStreamOptions } from './Stream';

export type state =
    | 'initializing'
    | 'readable'
    | 'canceled'
    | 'paused'
    | 'ended';

export default class ReadableStream<T, U> extends Stream<T, U> {
    private isPaused: boolean = false;

    private isCanceled: boolean = false;

    constructor(obj?: IStreamOptions<T, U>) {
        super(obj);
    }

    public get state(): state {
        if (this.isEnded) {
            return 'ended';
        }
        if (this.isCanceled) {
            return 'canceled';
        }
        if (this.isPaused) {
            return 'paused';
        }
        if (this.isReadable) {
            return 'readable';
        }
        return 'initializing';
    }

    public cancel() {
        this.emit('canceled');
        this.isCanceled = true;
    }

    public pause() {
        this.emit('paused');
        this.isPaused = true;
    }

    public resume() {
        this.emit('resumed');
        this.isPaused = false;
    }

    public push(input: T, ...args: any[]) {
        const output = super.push(input, ...args);
        const max = this.options.maxBuffer || 50000;
        if (this.buffer.length >= max) {
            this.pause();
        }
        return output;
    }
}
