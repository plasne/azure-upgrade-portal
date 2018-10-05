"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// includes
const PromiseImposter_1 = __importDefault(require("./PromiseImposter"));
class AzureQueueOperation extends PromiseImposter_1.default {
    constructor(queue, direction) {
        super();
        this.queue = queue;
        this.direction = direction;
        switch (direction) {
            case 'enqueue':
                this.message = arguments[2];
                break;
            case 'dequeue':
                this.count = arguments[2] || 1;
                break;
        }
    }
}
exports.default = AzureQueueOperation;
