import {Handle, EventObject} from './interfaces';
import {createCompositeHandle} from './util';
import * as aspect from './aspect';

export default class Evented {
	emit(data: EventObject): boolean {
		var type = '__on' + data.type;
		var method: Function = (<any> this)[type];
		if (method) {
			return method.apply(this, data);
		}
	};

	on(type: string, listener: (event: EventObject) => void): Handle;
	on(type: string[], listener: (event: EventObject) => void): Handle;
	on(type: any, listener: (event: EventObject) => void): Handle {
		// Array of event support, e.g. on(['foo', 'bar'], function () { /* ... */ })
		if (typeof type === 'array') {
			var handles: Handle[] = type.map(function (type: string): Handle {
				return this.on(type, listener);
			}, this);

			return createCompositeHandle.call(null, handles);
		}

		var name = '__on' + type;
		if (!(<any> this)[name]) {
			Object.defineProperty(this, name, {
				configurable: true,
				value: undefined,
				writable: true
			});
		}
		return aspect.default(this, '__on' + type, listener);
	};
}
