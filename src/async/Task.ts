import Promise, { State, Thenable, isThenable } from './Promise';
import { Executor } from '../Promise';

let Canceled = <State> 4;

export default class Task<T> extends Promise<T> {
	constructor(executor: Executor<T>, canceler: () => void) {
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

		this.canceler = canceler;
	}

	private canceler: () => void;
	
	private children: Task<any>[];

	private onCancel(): void {
		this.state = Canceled;
		Promise.resolve(() => this.doFinally()).finally(() => {
			return Promise.all(this.children.map((child) => {
				return child.doFinally();
			})).finally(() => this.children.forEach((child) => child.onCancel()));
		});
	}

	cancel(): void {
		if (this.state !== State.Pending) {
			return;
		}
		this.canceler();
	}

	then<U>(onFulfilled?: (value: T) => U | Thenable<U>,  onRejected?: (error: any) => U | Thenable<U>): Promise<U> {
		let task = <Task<U>> Task.copy(super.then<U>(onFulfilled, onRejected));
		// Propogate cancellation up the chain
		task.canceler = () => {
			this.cancel();
		}
		this.children.push(task);
		return task;
	}
}
