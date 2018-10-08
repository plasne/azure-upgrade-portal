"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// includes
const Stream_1 = __importDefault(require("./Stream"));
class ReadableStream extends Stream_1.default {
    constructor(obj) {
        super(obj);
        this.isPaused = false;
        this.isCanceled = false;
    }
    get state() {
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
    cancel() {
        this.emit('canceled');
        this.isCanceled = true;
    }
    pause() {
        this.emit('paused');
        this.isPaused = true;
    }
    resume() {
        this.emit('resumed');
        this.isPaused = false;
    }
    push(input, ...args) {
        const output = super.push(input, ...args);
        const max = this.options.maxBuffer || 50000;
        if (this.buffer.length >= max) {
            this.pause();
        }
        return output;
    }
}
exports.default = ReadableStream;
