"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// includes
const events_1 = require("events");
class PromiseImposter {
    constructor() {
        this.events = new events_1.EventEmitter();
    }
    resolve(...args) {
        this.events.emit('resolve', ...args);
        this.events.emit('finally', ...args);
    }
    reject(...args) {
        this.events.emit('reject', ...args);
        this.events.emit('catch', ...args);
        this.events.emit('finally', ...args);
    }
    then(resolve, reject) {
        this.events.on('resolve', (...args) => {
            resolve.call(this, ...args);
        });
        this.events.on('reject', (...args) => {
            if (reject)
                reject.call(this, ...args);
        });
        return this;
    }
    catch(reject) {
        this.events.on('catch', (...args) => {
            if (reject)
                reject.call(this, ...args);
        });
        return this;
    }
    finally(settled) {
        this.events.on('finally', (...args) => {
            if (settled)
                settled.call(this, ...args);
        });
        return this;
    }
    timeout(onevent, ms) {
        setTimeout(onevent, ms);
        return this;
    }
}
exports.default = PromiseImposter;
