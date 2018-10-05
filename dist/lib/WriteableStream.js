"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// includes
const Stream_1 = __importDefault(require("./Stream"));
class WriteableStream extends Stream_1.default {
    constructor(obj) {
        super(obj);
    }
    get state() {
        if (this.isEnded) {
            return 'ended';
        }
        if (this.isReadable) {
            return 'readable';
        }
        return 'initializing';
    }
    end() {
        this.emit('end');
    }
}
exports.default = WriteableStream;
