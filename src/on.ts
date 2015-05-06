import {Handle} from './interfaces';
import {createHandle} from './util'

interface ExtensionEvent {
	(target: any, listener: EventListener): Handle;
}

interface EventTarget {
	addEventListener(event: string, listener: EventListener, capture?: boolean): Handle;
	addEventListener(event: ExtensionEvent, listener: EventListener, capture?: boolean): Handle;
	removeEventListener(event: string, listener: EventListener, capture?: boolean): void;
	removeEventListener(event: ExtensionEvent, listener: EventListener, capture?: boolean): void;
}

interface EventEmitter {
    on(event: string, listener: Function): EventEmitter;
	removeListener(event: string, listener: Function): EventEmitter;
}

interface Evented {
	on(event: string, listener: EventListener): Handle;
	on(event: ExtensionEvent, listener: EventListener): Handle;
}

export default function on(target: EventTarget, type: string, listener: EventListener): Handle;
export default function on(target: EventTarget, type: ExtensionEvent, listener: EventListener): Handle;
export default function on(target: EventEmitter, type: string, listener: EventListener): Handle;
export default function on(target: EventEmitter, type: ExtensionEvent, listener: EventListener): Handle;
export default function on(target: Evented, type: string, listener: EventListener): Handle;
export default function on(target: Evented, type: ExtensionEvent, listener: EventListener): Handle;
export default function on(target: any, type: any, listener: EventListener): Handle {
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
		throw new TypeError('Unknown event emitter object')
	}
};
