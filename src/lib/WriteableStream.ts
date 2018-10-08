// includes
import Stream, { IStreamOptions } from './Stream';

export type state = 'initializing' | 'readable' | 'ended';

export default class WriteableStream<T, U> extends Stream<T, U> {
    constructor(obj?: IStreamOptions<T, U>) {
        super(obj);
    }

    public get state(): state {
        if (this.isEnded) {
            return 'ended';
        }
        if (this.isReadable) {
            return 'readable';
        }
        return 'initializing';
    }

    public end() {
        this.emit('end');
    }
}
