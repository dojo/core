import Map from '@dojo/shim/Map';
import { Handle, EventType, EventObject } from './interfaces';
import { on as aspectOn } from './aspect';
import { Destroyable } from './Destroyable';

/**
 * Handles an array of handles
 *
 * @param handles an array of handles
 * @returns a single Handle for handles passed
 */
function handlesArraytoHandle(handles: Handle[]): Handle {
	return {
		destroy() {
			handles.forEach((handle) => handle.destroy());
		}
	};
}

/**
 * Map of computed regular expressions, keyed by string
 */
const regexMap = new Map<string, RegExp>();

/**
 * Determines is the event type glob has been matched
 *
 * @returns boolean that indicates if the glob is matched
 */
export function isGlobMatch(globString: string | symbol, targetString: string | symbol): boolean {
	if (typeof targetString === 'string' && typeof globString === 'string' && globString.indexOf('*') !== -1) {
		let regex: RegExp;
		if (regexMap.has(globString)) {
			regex = regexMap.get(globString)!;
		}
		else {
			regex = new RegExp(`^${ globString.replace(/\*/g, '.*') }$`);
			regexMap.set(globString, regex);
		}
		return regex.test(targetString);

	} else {
		return globString === targetString;
	}
}

/**
 * Evented options interface
 */
export interface EventedOptions<M extends {} = {}> {
	listeners?: EventedListeners<M>;
}

export type EventedCallback<T extends EventType = EventType, E extends EventObject<T> = EventObject<T>> = {
	/**
	 * A callback that takes an `event` argument
	 *
	 * @param event The event object
	 */

	(event: E): boolean | void;
};

/**
 * A type which is either a targeted event listener or an array of listeners
 * @template T The type of target for the events
 * @template E The event type for the events
 */
export type EventedCallbackOrArray<T extends EventType = EventType, E extends EventObject<T> = EventObject<T>> = EventedCallback<T, E> | EventedCallback<T, E>[];

/**
 * A map of listeners to be applied, where the key of the map is the `event.type` to listen for
 */
export type EventedListeners<M extends {} = {}> = {
	[K in keyof M]?: EventedCallbackOrArray<K, M[K]>;
};

/**
 * Event Class
 */
export class Evented<M extends {}> extends Destroyable {

	/**
	 * map of listeners keyed by event type
	 */
	protected listenersMap: Map<EventType, EventedCallback> = new Map<EventType, EventedCallback>();

	/**
	 * @constructor
	 * @param options The constructor argurments
	 */
	constructor(options: EventedOptions<M> = {}) {
		super();
		const { listeners } = options;
		if (listeners) {
			this.own(this.on(listeners));
		}
	}

	/**
	 * Emits the event objet for the specified type
	 *
	 * @param event the event to emit
	 */
	emit<K extends keyof M>(event: M[K]): void;
	emit<E extends EventObject>(event: E): void;
	emit(event: any): void {
		this.listenersMap.forEach((method, type) => {
			if (isGlobMatch(type, event.type)) {
				method.call(this, event);
			}
		});
	}

	on(listeners: EventedListeners<M>): Handle;

	/**
	 * Catch all handler for various call signatures. The signatures are defined in
	 * `BaseEventedEvents`.  You can add your own event type -> handler types by extending
	 * `BaseEventedEvents`.  See example for details.
	 *
	 * @param args
	 *
	 * @example
	 *
	 * interface WidgetBaseEvents extends BaseEventedEvents {
	 *     (type: 'properties:changed', handler: PropertiesChangedHandler): Handle;
	 * }
	 * class WidgetBase extends Evented {
	 *    on: WidgetBaseEvents;
	 * }
	 *
	 * @return {any}
	 */
	on(type: symbol, listener: EventedCallbackOrArray<symbol>): Handle;
	on(type: string, listener: EventedCallbackOrArray<string>): Handle;
	on<K extends keyof M>(type: K, listener: EventedCallbackOrArray<K, M[K]>): Handle;
	on(...args: any[]): Handle {
		if (args.length === 2) {
			const [ type, listeners ] = <[ EventType, EventedCallbackOrArray ]> args;
			if (Array.isArray(listeners)) {
				const handles = listeners.map((listener) => aspectOn(this.listenersMap, type, listener));
				return handlesArraytoHandle(handles);
			}
			else {
				return aspectOn(this.listenersMap, type, listeners);
			}
		}
		else if (args.length === 1) {
			const [ listenerMapArg ] = <[ EventedListeners<M> ]> args;
			const handles = (Object.keys(listenerMapArg) as Array<keyof M>).map((type) => this.on(type, listenerMapArg[type]!));
			return handlesArraytoHandle(handles);
		}
		else {
			throw new TypeError('Invalid arguments');
		}
	}
}

export default Evented;
