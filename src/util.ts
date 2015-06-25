import has from './has';
import { Handle } from './interfaces';
import { createHandle } from './lang';

export function createTimer(callback: (...args: any[]) => void, delay: number = 0): Handle {
	let timerId = setTimeout(callback, delay);

	return createHandle(function () {
		clearTimeout(timerId);
		timerId = null;
	});
}

export function createInterval(callback: (...args: any[]) => void, delay: number = 0): Handle {
	let timerId = setInterval(callback, delay);

	return createHandle(function () {
		clearInterval(timerId);
		timerId = null;
	});
}


export function debounce<T extends (...args: any[]) => void>(callback: T, delay: number = 0): T {
	let timer: Handle;

	return <T> function () {
		timer && timer.destroy();

		let context = this;
		let args = arguments;

		timer = createTimer(function () {
			callback.apply(context, args);
			args = context = timer = null;
		}, delay);
	};
}

export function throttle<T extends (...args: any[]) => void>(callback: T, delay: number = 0): T {
	let ran: boolean;

	return <T> function () {
		if (ran) {
			return;
		}
		
		ran = true;
		
		callback.apply(this, arguments);
		setTimeout(function () {
			ran = null;
		}, delay);
	};
}

export function throttleAfter<T extends (...args: any[]) => void>(callback: T, delay: number = 0): T {
	let ran: boolean;

	return <T> function () {
		if (ran) {
			return;
		}

		ran = true;

		let context = this;
		let args = arguments;

		setTimeout(function () {
			callback.apply(context, args);
			args = context = ran = null;
		}, delay);
	};
}
