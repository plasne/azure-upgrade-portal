"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// includes
const azs = __importStar(require("azure-storage"));
const util = __importStar(require("util"));
const AzureQueueOperation_1 = __importDefault(require("./AzureQueueOperation"));
const ReadableStream_1 = __importDefault(require("./ReadableStream"));
const WriteableStream_1 = __importDefault(require("./WriteableStream"));
class AzureQueue {
    constructor(obj) {
        // establish the service
        if (obj.service) {
            this.service = obj.service;
        }
        else if (obj.connectionString) {
            this.service = azs.createQueueService(obj.connectionString);
            if (obj.encoder)
                this.encoder = obj.encoder;
            if (obj.useGlobalAgent)
                this.service.enableGlobalHttpAgent = true;
        }
        else if (obj.account && obj.sas) {
            const host = `https://${obj.account}.queue.core.windows.net`;
            this.service = azs.createQueueServiceWithSas(host, obj.sas);
            if (obj.encoder)
                this.encoder = obj.encoder;
            if (obj.useGlobalAgent)
                this.service.enableGlobalHttpAgent = true;
        }
        else if (obj.account && obj.key) {
            this.service = azs.createQueueService(obj.account, obj.key);
            if (obj.encoder)
                this.encoder = obj.encoder;
            if (obj.useGlobalAgent)
                this.service.enableGlobalHttpAgent = true;
        }
        else {
            throw new Error('You must specify service, connectionString, account/sas, or account/key.');
        }
    }
    /** Returns *true* if there are any messages in the queue. */
    async hasMessages(queue) {
        const getQueueMetadata = util
            .promisify(azs.QueueService.prototype.getQueueMetadata)
            .bind(this.service);
        const result = await getQueueMetadata(queue);
        if (result.approximateMessageCount == null) {
            return true; // it is safer to assume there could be
        }
        return result.approximateMessageCount > 0;
    }
    queueStream() {
        // get arguments
        const inOptions = arguments[0] || {};
        const outOptions = arguments[1] || {};
        // create the streams
        const streams = {
            in: new WriteableStream_1.default(inOptions),
            out: new ReadableStream_1.default(outOptions)
        };
        // promisify
        const createMessage = util
            .promisify(azs.QueueService.prototype.createMessage)
            .bind(this.service);
        // produce promises to commit the operations
        streams.out
            .process(streams.in, () => {
            // enqueue
            const op = streams.in.buffer.shift();
            if (op) {
                const toString = typeof op.message === 'object'
                    ? JSON.stringify(op.message)
                    : op.message;
                return createMessage(op.queue, toString || '')
                    .then(result => {
                    streams.out.emit('success', result);
                    op.resolve(result);
                })
                    .catch(error => {
                    streams.out.emit('error', error);
                    op.reject(error);
                });
            }
            // nothing else to do
            return null;
        })
            .catch(error => {
            streams.out.emit('error', error);
        });
        return streams;
    }
    queue(operations, inOptions, outOptions) {
        // start the stream
        const streams = this.queueStream(inOptions || {}, outOptions || {});
        // push the operations
        if (Array.isArray(operations)) {
            for (const operation of operations) {
                streams.in.push(operation);
            }
        }
        else {
            streams.in.push(operations);
        }
        // end the input stream
        streams.in.end();
        return streams.out;
    }
    queueAsync(operations, inOptions, outOptions) {
        return new Promise((resolve, reject) => {
            try {
                // start commit
                const stream = this.queue(operations, inOptions, outOptions);
                // resolve when done
                stream.once('end', () => {
                    resolve();
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    enqueueMessages(queue, messages) {
        const operations = [];
        for (const message of messages) {
            const toString = typeof message === 'object' ? JSON.stringify(message) : message;
            operations.push(new AzureQueueOperation_1.default(queue, 'enqueue', toString));
        }
        return this.queueAsync(operations);
    }
    // add a single message to the queue
    enqueueMessage(queue, message) {
        const createMessage = util
            .promisify(azs.QueueService.prototype.createMessage)
            .bind(this.service);
        const toString = typeof message === 'object' ? JSON.stringify(message) : message;
        return createMessage(queue, toString);
    }
    dequeueMessages(queue, count = 1) {
        const getMessages = util
            .promisify(azs.QueueService.prototype.getMessages)
            .bind(this.service);
        return getMessages(queue, {
            numOfMessages: count
        });
    }
    /** A Promise to create the queue if it doesn't exist. */
    createQueueIfNotExists(queue) {
        const createQueueIfNotExists = util
            .promisify(azs.QueueService.prototype.createQueueIfNotExists)
            .bind(this.service);
        return createQueueIfNotExists(queue);
    }
    /** Specify the encoding method ("base64" | "xml" | "binary"). */
    set encoder(option) {
        switch (option) {
            case 'base64':
                this.service.messageEncoder = new azs.QueueMessageEncoder.TextBase64QueueMessageEncoder();
                break;
            case 'xml':
                this.service.messageEncoder = new azs.QueueMessageEncoder.TextXmlQueueMessageEncoder();
                break;
            case 'binary':
                this.service.messageEncoder = new azs.QueueMessageEncoder.BinaryBase64QueueMessageEncoder();
                break;
        }
    }
}
exports.default = AzureQueue;
