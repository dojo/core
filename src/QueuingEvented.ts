import { Handle, EventObject } from './interfaces';
import Map from '@dojo/shim/Map';
import Evented, { isGlobMatch } from './Evented';

/**
 * An implementation of the Evented class that queues up events when no listeners are
 * listening. When a listener is subscribed, the queue will be published to the listener.
 * When the queue is full, the oldest events will be discarded to make room for the newest ones.
 *
 * @property maxEvents  The number of events to queue before old events are discarded. If zero (default), an unlimited number of events is queued.
 */
class QueuingEvented<M extends {} = {}> extends Evented<M> {
	private _queue: Map<string | symbol, EventObject[]>;

	maxEvents = 0;

	constructor() {
		super();

		this._queue = new Map<string, EventObject[]>();
	}
}

(function (proto) {
	QueuingEvented.prototype.emit = function emit(event: any): void {
		proto.emit.call(this, event);

		let hasMatch = false;

		// @ts-ignore
		this.listenersMap.forEach((method, type) => {
			if (isGlobMatch(type, event.type)) {
				hasMatch = true;
			}
		});

		if (!hasMatch) {
			// @ts-ignore
			let queue = this._queue.get(event.type);

			if (!queue) {
				queue = [];
				// @ts-ignore
				this._queue.set(event.type, queue);
			}

			queue.push(event);

			if (this.maxEvents > 0) {
				while (queue.length > this.maxEvents) {
					queue.shift();
				}
			}
		}
	};

	QueuingEvented.prototype.on = function on(...args: any[]): Handle {
		let handle = proto.on.call(this, ...args);

		// @ts-ignore
		this.listenersMap.forEach((method, listenerType) => {
			// @ts-ignore
			this._queue.forEach((events, queuedType) => {
				if (isGlobMatch(listenerType, queuedType)) {
					events.forEach((event) => this.emit(event));
					// @ts-ignore
					this._queue.delete(queuedType);
				}
			});
		});

		return handle;
	};
})(Evented.prototype);

export default QueuingEvented;
