import Evented from './Evented';
import { EventObject, Handle } from './interfaces';
import WeakMap from '@dojo/shim/WeakMap';

interface QueuingEventedData {
	queue: { [eventType: string]: EventObject[] };
	subscribed: { [eventType: string]: boolean };
}

const queingEventedSubscribers = new WeakMap<QueuingEvented, QueuingEventedData>();

export default class QueuingEvented extends Evented {
	maxEvents: number = 0;

	constructor() {
		super();

		queingEventedSubscribers.set(this, {
			queue: {},
			subscribed: {}
		});
	}

	emit<T extends EventObject>(data: T): void {
		const queueData = queingEventedSubscribers.get(this);

		if (!queueData.subscribed[ data.type ]) {
			let eventQueue = queueData.queue[ data.type ];

			if (eventQueue === undefined) {
				eventQueue = [];
				queueData.queue[ data.type ] = eventQueue;
			}

			eventQueue.push(data);

			if (this.maxEvents > 0 && eventQueue.length > this.maxEvents) {
				eventQueue.shift();
			}

			return;
		}

		super.emit(data);
	}

	on(type: string, listener: (event: EventObject) => void): Handle {
		const result = super.on(type, listener);

		const queueData = queingEventedSubscribers.get(this);

		queueData.subscribed[ type ] = true;

		const eventQueue = queueData.queue[ type ];

		if (eventQueue !== undefined) {
			// dispatch queued events
			eventQueue.forEach((eventObject) => {
				this.emit(eventObject);
			});

			queueData.queue[ type ] = [];
		}

		return result;
	}
}
