import {Handle} from './interfaces';

export function createHandle(destructor: () => void): Handle {
	return {
		destroy: function () {
			this.destroy = function () {};
			destructor.call(this);
		}
	};
}

export function createCompositeHandle(...handles: Handle[]): Handle {
	return createHandle(function () {
		for (var i = 0, handle: Handle; (handle = handles[i]); ++i) {
			handle.destroy();
		}
	});
}
