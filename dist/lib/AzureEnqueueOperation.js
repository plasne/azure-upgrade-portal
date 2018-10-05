"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// includes
const PromiseImposter_1 = __importDefault(require("./PromiseImposter"));
class AzureEnqueueOperation extends PromiseImposter_1.default {
    /** This class designates an queue operation that can be queued, streamed, etc.
     * After creating an object, you may be alerted when its operation is complete using .then(),
     * .finally(), and trap errors with .catch().
     */
    constructor(queue, message) {
        super();
        this.queue = queue;
        this.message = message;
    }
}
exports.default = AzureEnqueueOperation;
