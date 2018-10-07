// includes
import { EventEmitter } from 'events';

type anyfunc = (...args: any[]) => any | void | undefined;

export default abstract class PromiseImposter {
    private events: EventEmitter = new EventEmitter();

    public resolve(...args: any[]) {
        this.events.emit('resolve', ...args);
        this.events.emit('finally', ...args);
    }

    public reject(...args: any[]) {
        this.events.emit('reject', ...args);
        this.events.emit('catch', ...args);
        this.events.emit('finally', ...args);
    }

    public then(resolve: anyfunc, reject?: anyfunc) {
        this.events.on('resolve', (...args: any[]) => {
            resolve.call(this, ...args);
        });
        this.events.on('reject', (...args: any[]) => {
            if (reject) reject.call(this, ...args);
        });
        return this;
    }

    public catch(reject: anyfunc) {
        this.events.on('catch', (...args: any[]) => {
            if (reject) reject.call(this, ...args);
        });
        return this;
    }

    public finally(settled: anyfunc) {
        this.events.on('finally', (...args: any[]) => {
            if (settled) settled.call(this, ...args);
        });
        return this;
    }

    public timeout(onevent: anyfunc, ms: number) {
        setTimeout(onevent, ms);
        return this;
    }
}
