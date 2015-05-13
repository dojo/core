import { Handle, EventObject } from './interfaces';
import { createHandle, createCompositeHandle } from './lang';
import Evented from './Evented';

// Only used for Evented and EventEmitter, as EventTarget uses EventListener
type EventCallback = (event: {}) => void;

export interface ExtensionEvent {
	(target: any, listener: EventCallback): Handle;
}

export interface EventTarget {
	accessKey?: string;
	addEventListener(event: string, listener: EventListener, capture?: boolean): void;
	removeEventListener(event: string, listener: EventListener, capture?: boolean): void;
}

export interface EventEmitter {
	on(event: string, listener: EventCallback): EventEmitter;
	removeListener(event: string, listener: EventCallback): EventEmitter;
}

export default function on(target: EventTarget, type: string, listener: EventListener, capture?: boolean): Handle;
export default function on(target: EventTarget, type: ExtensionEvent, listener: EventListener, capture?: boolean): Handle;
export default function on(target: EventTarget, type: (string | ExtensionEvent)[], listener: EventListener, capture?: boolean): Handle;

export default function on(target: EventEmitter, type: string, listener: EventCallback): Handle;
export default function on(target: EventEmitter, type: ExtensionEvent, listener: EventCallback): Handle;
export default function on(target: EventEmitter, type: (string | ExtensionEvent)[], listener: EventCallback): Handle;

export default function on(target: Evented, type: string, listener: EventCallback): Handle;
export default function on(target: Evented, type: ExtensionEvent, listener: EventCallback): Handle;
export default function on(target: Evented, type: (string | ExtensionEvent)[], listener: EventCallback): Handle;

export default function on(target: any, type: any, listener: any, capture?: boolean): Handle {
	if (type.call) {
		return type.call(this, target, listener, capture);
	}

	if (Array.isArray(type)) {
		var handles: Handle[] = type.map(function (type: string): Handle {
			return on(target, type, listener, capture);
		});

		return createCompositeHandle.apply(null, handles);
	}

	if (target.addEventListener && target.removeEventListener) {
		const callback = function () {
			listener.apply(this, arguments);
		}
		target.addEventListener(type, callback, capture);
		return createHandle(function () { target.removeEventListener(type, callback, capture); });
	}

	if (target.on && target.removeListener) {
		target.on(type, listener);
		return createHandle(function () { target.removeListener(type, listener); });
	}

	if (target.on) {
		return target.on(type, listener);
	}

	throw new TypeError('Unknown event emitter object');
}

export function emit(target: EventTarget, event: EventObject): boolean;
export function emit(target: EventEmitter, event: EventObject): boolean;
export function emit(target: Evented, event: EventObject): boolean;

export function emit(target: any, event: any): boolean {
	if (target.dispatchEvent && target.ownerDocument && target.ownerDocument.createEvent) {
		var nativeEvent = target.ownerDocument.createEvent('HTMLEvents');
		nativeEvent.initEvent(event.type, Boolean(event.bubbles), Boolean(event.cancelable));

		for (var key in event) {
			if (!(key in nativeEvent)) {
				nativeEvent[key] = event[key];
			}
		}

		return target.dispatchEvent(nativeEvent);
	}

	if (target.emit && target.removeListener) {
		return target.emit(event.type, event);
	}

	if (target.emit && target.on) {
		target.emit(event);
		return false;
	}

	throw new Error('Target must be an event emitter');
}
