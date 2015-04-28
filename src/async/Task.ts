import Promise, { State, Thenable } from './Promise';
import { Executor } from '../Promise';

let Canceled = <State> 4;

export default class Task<T> extends Promise<T> {
	protected static copy<U>(other: Promise<U>): Task<U> {
		var promise = <Task<U>> super.copy(other);

		if (other instanceof Promise && other._state !== State.Pending) {
			promise._state = other._state;
		}
		else {
			other.then(
				() => promise._state = State.Fulfilled,
				() => promise._state = State.Rejected
			);
		}
		return promise;
	}

	constructor(executor: Executor<T>, canceler: () => void) {
		this.canceler = canceler;

		super(<Executor<T>> ((resolve, reject) => {
			executor(
				(value?: T | Thenable<T>): void => {
					if (this.state === Canceled) {
						return;
					}
					resolve(value);
				},
				(reason?: Error): void => {
					if (this.state === Canceled) {
						return;
					}
					reject(reason);
				}
			);
		}));
	}

	private canceler: () => void;

	cancel(): void {
		if (this.state !== State.Pending) {
			return;
		}
		this.state = Canceled;
		this.canceler();
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

		return <Task<T>> this.then<T>(handler.bind(null, false), handler.bind(null, true));
	}

	then<U>(onFulfilled?: (value: T) => U | Thenable<U>,  onRejected?: (error: any) => U | Thenable<U>): Promise<U> {
		var task = Task.copy(super.then<U>(onFulfilled, onRejected));
		task.canceler = () => this.cancel();
		return task;
	}
}
