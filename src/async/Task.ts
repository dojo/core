import Promise, { State, Thenable } from './Promise';
import { Executor } from '../Promise';

let Canceled = <State> 4;

export default class Task<T> extends Promise<T> {
	constructor(executor: Executor<T>, canceler: () => void) {
		if (canceler) {
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
}
