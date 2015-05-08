import { Handle, EventObject } from './interfaces';
import { createCompositeHandle } from './lang';
import * as aspect from './aspect';

export default class Evented {
	emit(data: EventObject): boolean {
		var type = '__on' + data.type;
		var method: Function = (<any> this)[type];
		if (method) {
			return method.call(this, data);
		}
	};

	on(type: string, listener: (event: EventObject) => void): Handle {
		var name = '__on' + type;
		if (!(<any> this)[name]) {
			Object.defineProperty(this, name, {
				configurable: true,
				value: undefined,
				writable: true
			});
		}
		return aspect.on(this, '__on' + type, listener);
	};
}
