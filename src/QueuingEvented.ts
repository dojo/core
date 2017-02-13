import { EventedListenersMap, EventedListenerOrArray } from '@dojo/interfaces/bases';
import { EventObject, Handle, EventTargettedObject, EventErrorObject } from '@dojo/interfaces/core';
import Map from '@dojo/shim/Map';
import Evented, { isGlobMatch } from './Evented';

/**
 * An implementation of the Evented class that queues up events when no listeners are
 * listening. When a listener is subscribed, the queue will be published to the listener.
 * When the queue is full, the oldest events will be discarded to make room for the newest ones.
 *
 * @property maxEvents  The number of events to queue before old events are discarded. If zero (default), an unlimited number of events is queued.
 */
export default class QueuingEvented extends Evented {
	private _queue: Map<string, EventObject[]>;

	maxEvents: number = 0;

	constructor() {
		super();

		this._queue = new Map<string, EventObject[]>();
	}

	emit<E extends EventObject>(event: E): void {
		super.emit(event);

		let hasMatch = false;

		this.listenersMap.forEach((method, type) => {
			if (isGlobMatch(type, event.type)) {
				hasMatch = true;
			}
		});

		if (!hasMatch) {
			let queue = this._queue.get(event.type);

			if (!queue) {
				queue = [];
				this._queue.set(event.type, queue);
			}

			queue.push(event);

			if (this.maxEvents > 0) {
				while (queue.length > this.maxEvents) {
					queue.shift();
				}
			}
		}
	}

	on(listeners: EventedListenersMap<Evented>): Handle;
	on(type: string, listener: EventedListenerOrArray<Evented, EventTargettedObject<Evented>>): Handle;
	on(type: 'error', listener: EventedListenerOrArray<Evented, EventErrorObject<Evented>>): Handle;
	on(...args: any[]): Handle {
		let handle = (<any> super.on)(...args);

		this.listenersMap.forEach((method, listenerType) => {
			this._queue.forEach((events, queuedType) => {
				if (isGlobMatch(listenerType, queuedType)) {
					events.forEach((event) => this.emit(event));
					this._queue.delete(queuedType);
				}
			});
		});

		return handle;
	}
}
