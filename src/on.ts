import { Handle, EventObject } from './interfaces';
import { createHandle, createCompositeHandle } from './lang';
import Evented from './Evented';

// Only used for Evented and EventEmitter, as EventTarget uses EventListener
type EventCallback = (event: {}) => void;

interface ExtensionEvent {
	(target: any, listener: EventCallback): Handle;
}

interface EventTarget {
	addEventListener(event: string, listener: EventListener, capture?: boolean): Handle;
	removeEventListener(event: string, listener: EventListener, capture?: boolean): void;
}

interface EventEmitter {
    on(event: string, listener: EventCallback): EventEmitter;
	removeListener(event: string, listener: EventCallback): EventEmitter;
}

export default function on(target: EventTarget, type: string, listener: EventListener, capture?: boolean): Handle;
export default function on(target: EventTarget, type: ExtensionEvent, listener: EventListener, capture?: boolean): Handle;
export default function on(target: EventTarget, type: [string|ExtensionEvent], listener: EventListener, capture?: boolean): Handle;

export default function on(target: EventEmitter, type: string, listener: EventCallback): Handle;
export default function on(target: EventEmitter, type: ExtensionEvent, listener: EventCallback): Handle;
export default function on(target: EventEmitter, type: [string|ExtensionEvent], listener: EventCallback): Handle;

export default function on(target: Evented, type: string, listener: EventCallback): Handle;
export default function on(target: Evented, type: ExtensionEvent, listener: EventCallback): Handle;
export default function on(target: Evented, type: [string|ExtensionEvent], listener: EventCallback): Handle;

export default function on(target: any, type: any, listener: EventListener, capture?: boolean): Handle {
	if (type.call) {
		return type.call(this, target, listener, capture);
	}

	if (!!type.shift) {
		var handles: Handle[] = type.map(function (type: string): Handle {
			return on(target, type, listener, capture);
		});

		return createCompositeHandle.apply(null, handles);
	}

	if (target.addEventListener && target.removeEventListener) {
		target.addEventListener(type, listener, false);
		return createHandle(function () { target.removeEventListener(type, listener, false); });
	}
	else if (target.on && target.removeListener) {
		target.on(type, listener);
		return createHandle(function () { target.removeListener(type, listener); });
	}
	else if (target.on) {
		return target.on(type, listener);
	}
	else {
		throw new TypeError('Unknown event emitter object');
	}
};

// TODO: What should this return type signature be? Boolean for cancel? The event object itself?
export function emit(target: EventTarget, event: EventObject): boolean;
export function emit(target: EventEmitter, event: EventObject): boolean;
export function emit(target: Evented, event: EventObject): boolean;
export function emit(target: any, event: any): boolean {
	if (target.emit && target.removeListener) {
		return target.emit(event.type, event);
	}
	else if (target.emit) {
		return target.emit(event, event);
	}

	if (typeof target.emit === 'function' && !target.nodeType) {
		return target.emit(event.type, event);
	}

	if (target.dispatchEvent && target.ownerDocument && target.ownerDocument.createEvent) {
		var nativeEvent = target.ownerDocument.createEvent('HTMLEvents');
		nativeEvent.initEvent(event.type, Boolean(event.bubbles), Boolean(event.cancelable));

		for (var key in event) {
			if (!(key in nativeEvent)) {
				nativeEvent[key];
			}
		}

		return target.dispatchEvent(nativeEvent);
	}

	throw new Error('Target must be an event emitter');
}
