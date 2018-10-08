// includes
import PromiseImposter from './PromiseImposter';

export default class AzureQueueOperation extends PromiseImposter {
    public direction: 'enqueue' | 'dequeue';
    public queue: string;
    public message?: string | object;
    public count?: number;

    /** This class designates an queue operation that can be queued, streamed, etc.
     * After creating an object, you may be alerted when its operation is complete using .then(),
     * .finally(), and trap errors with .catch().
     */
    constructor(queue: string, direction: 'enqueue', message: string | object);

    constructor(queue: string, direction: 'dequeue', count?: number);

    constructor(queue: string, direction: 'enqueue' | 'dequeue') {
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
