import has from './has';
import { Handle, Hash } from './interfaces';
import { getPropertyDescriptor, isIdentical } from './lang';
import { queueMicroTask } from './queue';
import Scheduler from './Scheduler';

export class BaseObjectObserver {
	protected _listener: (events: PropertyEvent[]) => any;
	protected _propertyStore: {};
	protected _target: any;

	constructor(kwArgs?: KwArgs) {
		this._listener = kwArgs.listener;
		this._propertyStore = {};
		this._target = kwArgs.target;
	}
}

export interface KwArgs {
	listener: (events: PropertyEvent[]) => any;
	nextTurn?: boolean;
	onlyReportObserved?: boolean;
	target: {};
}

module ES5 {
	/**
	* The scheduler used to mimic native `Object.observe` reporting. Note that all changes to all
	* observed objects are notified within the same scheduled microtask.
	*/
	const scheduler = new Scheduler({ queueFunction: queueMicroTask });

	export class Observer extends BaseObjectObserver implements Observer {
		/**
		* Determines whether change notifications should be fired immediately (`false`) or queued with
		* the scheduler (`true`, thus mimicking native `Object.observe` behavior). Defaults to `true`.
		*/
		nextTurn: boolean;

		protected _boundDispatch: () => void;
		protected _currentlyScheduled: Hash<PropertyEvent>;
		protected _descriptors: Hash<PropertyDescriptor>;

		/**
		* Creates a new Observer to watch and notify listeners of changes.
		*
		* This should only be used when 1) there is no native `Object.observe` implementation or 2) notifications
		* should be fired immediately rather than queued.
		*
		* @constructor
		*
		* @param kwArgs
		* The `kwArgs` object is expected to contain the target object to observe and the callback
		* that will be fired when changes occur.
		*/
		constructor(kwArgs: KwArgs) {
			super(kwArgs);

			this.nextTurn = ('nextTurn' in kwArgs) ? kwArgs.nextTurn : true;

			this._descriptors = {};
			this._boundDispatch = this._dispatch.bind(this);
		}

		protected _dispatch() {
			let queue = this._currentlyScheduled;
			let events: PropertyEvent[] = Object.keys(queue).map(function (property: string): PropertyEvent {
				return queue[property];
			});

			this._currentlyScheduled = null;
			this._listener(events);
		}

		protected _restore(property: string): void {
			let target = this._target;
			let store = this._propertyStore;

			Object.defineProperty(target, property, (this._descriptors[property] || {
				configurable: true,
				enumerable: true,
				value: target[property],
				writable: true
			}));

			target[property] = (<any> store)[property];
		}

		protected _schedule(property: string): void {
			let event: PropertyEvent = {
				target: this._target,
				name: property
			};

			if (this.nextTurn) {
				if (!this._currentlyScheduled) {
					this._currentlyScheduled = {};
					scheduler.schedule(this._boundDispatch);
				}

				this._currentlyScheduled[property] = event;
			}
			else {
				this._listener([ event ]);
			}
		}

		/**
		* Ends all notifications on the target, restoring it to its original state.
		*/
		destroy(): void {
			let descriptors = this._descriptors;

			Object.keys(descriptors).forEach(this._restore, this);
			this._descriptors = this._listener = this._propertyStore = this._target = null;
		}

		/**
		* Enables notifications for the given property (or properties).
		*
		* @param properties The property name or arguments list of property names that will be observed.
		*/
		observeProperty(...properties: string[]): void {
			let target = this._target;
			let store = <any> this._propertyStore;
			let self = this;

			properties.forEach(function (property: string): void {
				let descriptor: PropertyDescriptor;
				if (property in target) {
					descriptor = getPropertyDescriptor(target, property);
				}
				else {
					descriptor = {
						enumerable: true,
						configurable: true,
						writable: true
					};
				}

				if (descriptor.writable) {
					let observableDescriptor: PropertyDescriptor = {
						configurable: descriptor ? descriptor.configurable : true,
						enumerable: descriptor ? descriptor.enumerable : true,
						get: function (): any {
							return store[property];
						},
						set: function (value: any): void {
							let previous: any = store[property];

							if (!isIdentical(value, previous)) {
								store[property] = value;

								self._schedule(property);
							}
						}
					};

					store[property] = target[property];
					self._descriptors[property] = descriptor;
					Object.defineProperty(target, property, observableDescriptor);
				}
			});
		}

		/**
		* Disables notifications for the given property (or properties).
		*
		* @param properties The property name or arguments list of property names that will be removed.
		*/
		removeProperty(...properties: string[]): void {
			let store = this._propertyStore;

			properties.forEach(function (property: string): void {
				this._restore(property);
				// Since the store is just a simple map, using the `delete` operator is not problematic.
				delete (<any> store)[property];
			}, this);
		}
	}
}

module ES7 {
	interface ChangeEvent {
		name: string;
		object: {};
		oldValue: any;
		type: string;
	}

	export class Observer extends BaseObjectObserver implements Observer {
		/**
		* Determines whether to block notifications for properties not added via `observeProperty`.
		* Defaults to `true.`
		*
		* Since `Object.observe` automatically reports any changes to the underlying object, there
		* needs to be a mechanism for ensuring consistency with `ObjectObserver` in environments
		* without a native `Object.observe` implementation.
		*/
		onlyReportObserved: boolean;

		protected _observeHandler: (changes: any[]) => void;

		/**
		* Creates a new Es7Observer that uses `Object.observe` to watch and notify listeners of changes.
		*
		* Requires a native `Object.observe` implementation.
		*
		* @constructor
		*
		* @param kwArgs
		* The `kwArgs` object is expected to contain the target object to observe and the callback
		* that will be fired when changes occur.
		*/
		constructor(kwArgs: KwArgs) {
			super(kwArgs);

			this.onlyReportObserved = ('onlyReportObserved' in kwArgs) ? kwArgs.onlyReportObserved : true;
			this._setObserver();
		}

		/**
		* Initializes observation on the underlying object, preventing multiple changes to the same
		* property from emitting multiple notifications.
		*/
		protected _setObserver(): void {
			const store = this._propertyStore;
			const target = this._target;

			this._observeHandler = function (changes: ChangeEvent[]): void {
				const propertyMap: Hash<number> = {};
				const events: PropertyEvent[] = changes.reduce(function (
					events: PropertyEvent[],
					change: ChangeEvent
				): PropertyEvent[] {
					const property: string = change.name;

					if (!this.onlyReportObserved || (property in store)) {
						if (property in propertyMap) {
							events.splice(propertyMap[property], 1);
						}

						propertyMap[property] = events.length;

						events.push({
							target: target,
							name: property
						});
					}

					return events;
				}.bind(this), []);

				if (events.length) {
					this._listener(events);
				}
			}.bind(this);

			(<any> Object).observe(target, this._observeHandler);
		}

		/**
		* Ends all notifications on the target.
		*/
		destroy(): void {
			const target = this._target;

			(<any> Object).unobserve(target, this._observeHandler);
			this._listener = this._observeHandler = this._propertyStore = this._target = null;
		}

		/**
		* Enables notifications for the given property (or properties).
		*
		* If the `onlyReportObserved` option is `false`, then adding new properties will have no effect until
		* `onlyReportObserved` is reset to `true`.
		*
		* @param properties The property name or arguments list of property names that will be observed.
		*/
		observeProperty(...properties: string[]): void {
			const store = <any> this._propertyStore;

			properties.forEach(function (property: string): void {
				store[property] = 1;
			});
		}

		/**
		* Disables notifications for the given property (or properties).
		*
		* If the `onlyReportObserved` option is `false`, then removing properties will have no effect until
		* `onlyReportObserved` is reset to `true`.
		*
		* * @param properties The property name or arguments list of property names that will be removed.
		*/
		removeProperty(...properties: string[]): void {
			const store = this._propertyStore;

			properties.forEach(function (property: string): void {
				// Since the store is just a simple map, using the `delete` operator is not problematic.
				delete (<any> store)[property];
			});
		}
	}
}

export default function observe(kwArgs: ObserveArgs): Observer {
	const Ctor = kwArgs.nextTurn && has('object-observe') ? ES7.Observer : ES5.Observer;

	return new Ctor(kwArgs);
}

export interface ObserveArgs {
	listener: (events: PropertyEvent[]) => any;
	nextTurn?: boolean;
	onlyReportObserved?: boolean;
	target: {}
}

export interface Observer extends Handle {
	observeProperty(...property: string[]): void;
	removeProperty(...property: string[]): void;
    nextTurn?: boolean;
    onlyReportObserved?: boolean;
}

export interface PropertyEvent {
	target: {};
	name: string;
}
