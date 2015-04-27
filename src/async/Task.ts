import Promise, { State, Thenable } from './Promise';
import { Executor } from '../Promise';

let Canceled = <State> 4;

export default class Task<T> extends Promise<T> {
	static all<T>(items: (T | Thenable<T>)[]): Task<T[]> {
		return new Task<T[]>(Promise.all<T>(items));
	}

	static race<T>(items: (T | Thenable<T>)[]): Task<T> {
		return new Task<T>(Promise.race<T>(items));
	}

	static reject<T>(reason: any): Task<T> {
		return new Task<T>(Promise.reject<T>(reason));
	}

	static resolve<T>(value: (T | Thenable<T>)): Task<T> {
		return new Task<T>(Promise.resolve<T>(value));
	}

	constructor(executor: Executor<T> | Promise<T>, canceler?: () => void) {
		if (!(executor instanceof Promise) && canceler) {
			let oldExecutor = <Executor<T>> executor;
			let createCancelable = (handler: (value?: any) => void) => {
				return (value: any) => {
					if (this._state !== Canceled) {
						handler(value);
					}
				}
			}
			executor = (resolve, reject) => {
				oldExecutor(createCancelable(resolve), createCancelable(reject));
			};

			this.cancel = (): void => {
				if (this._state === State.Pending) {
					this._state = Canceled;
				}
			};
		}

		super(executor);
	}

	cancel(): void {}

	catch<U>(onRejected: (reason?: any) => (U | Thenable<U>)): Task<U> {
		return this.then<U>(null, onRejected);
	}

	finally(callback: () => void | Thenable<any>): Task<T> {
		// handler to be used for fulfillment and rejection; whether it was fulfilled or rejected is explicitly
		// indicated by the first argument
		let handler = (rejected: boolean, valueOrError: any) => {
			let result: any;
			try {
				result = callback();
				if (result && typeof result.then === 'function') {
					return result.then(
						() => {
							if (rejected) {
								throw valueOrError;
							}
							return valueOrError;
						}
					);
				}
				else {
					if (rejected) {
						throw valueOrError;
					}
					return valueOrError;
				}
			}
			catch (error) {
				return Promise.reject(error);
			}
		};

		return this.then<T>(handler.bind(null, false), handler.bind(null, true));
	}

	then<U>(
		onFulfilled?: (value?: T) => (U | Thenable<U>),
		onRejected?: (reason?: any) => (U | Thenable<U>)
	): Task<U> {
		return new Task<U>(super.then<U>(onFulfilled, onRejected));
	}
}
