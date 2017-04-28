import { SubscriptionObserver } from '@dojo/shim/Observable';

export default class SubscriptionPool<T> {
	private _observers: SubscriptionObserver<T>[] = [];

	add(subscription: SubscriptionObserver<T>) {
		this._observers.push(subscription);

		return () => {
			this._observers.splice(this._observers.indexOf(subscription), 1);
		};
	}

	next(value: T) {
		this._observers.forEach(observer => {
			observer.next(value);
		});
	}

	complete() {
		this._observers.forEach(observer => {
			observer.complete();
		});
	}
}
