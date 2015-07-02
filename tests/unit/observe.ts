import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import Test = require('intern/lib/Test');
import has from 'src/has';
import observe, { PropertyEvent } from 'src/observe';

registerSuite({
	name: 'observe',

	'nextTurn is true'() {
		const observer = observe({
			target: {},
			listener: function () {},
			nextTurn: true
		});
		assert(observer);
	},

	'nextTurn is false'() {
		const observer = observe({
			target: {},
			listener: function () {},
			nextTurn: false
		});
		assert(observer);
	},

	'onlyReportObserved is true'() {
		const dfd: Test.Deferred<PropertyEvent[]> = this.async(5000);
		const object: { a: number; b?: number; } = { a: 1 };

		const observer = observe({
			target: {},
			listener: dfd.rejectOnError(function(events: PropertyEvent[]) {
				assert(false);
			}),
			nextTurn: true,
			onlyReportObserved: true
		});

		observer.observeProperty('a');
		object.b = 3;

		setTimeout(dfd.callback(function () {
			assert.isTrue(observer.onlyReportObserved, 'onlyReportObserved should be passed to the observer instance.');
		}), 100);
	},

	'onlyReportObserved is false'() {
		if (!has('object-observe')) {
			this.skip('Native Object.observe support is required for this test.');
		}

		const dfd = this.async(5000);
		const object: { a: number; b?: number } = { a: 1 };

		const observer = observe({
			onlyReportObserved: false,
			nextTurn: true,
			target: object,
			listener: dfd.callback(function (events: PropertyEvent[]): any {
				const target = events[0].target;
				assert.equal((<any> target)[events[0].name], 3);
			})
		});

		object.b = 3;
	},

	propertyChanges() {
		const dfd: Test.Deferred<PropertyEvent[]> = this.async(5000);
		const object = Object.create(Object.prototype, {
			a: {
				enumerable: false,
				configurable: true,
				writable: true,
				value: 1
			}
		});

		let b: number;
		let length: number;

		const observer = observe({
			target: object,
			listener: dfd.callback(function (events: PropertyEvent[]) {
				const target: any = events[0].target;
				const b: number = target[events[0].name];

				assert.equal(b, 3);
				assert.isFalse(Object.getOwnPropertyDescriptor(object, 'a').enumerable);
				assert.equal(events.length, 1, 'Changes to the same property should only be reported once.');
			})
		});

		observer.observeProperty('a');

		object.a += 1;
		object.a = 3;
	},

	'.removeProperty()'() {
		const dfd = this.async(5000);
		const mirror: { a: number; b: string } = { a: null, b: null };
		const object: { a: number; b: string } = { a: 1, b: 'Lorem' };
		const observer = observe({
			target: object,
			listener: function (events: PropertyEvent[]): any {
				const target = events[0].target;

				(<any> mirror)[events[0].name] = (<any> target)[events[0].name];
			}
		});

		observer.observeProperty('a', 'b');
		observer.removeProperty('b');
		object.a += 1;
		object.b += ' ipsum';

		setTimeout(dfd.callback(function () {
			assert.equal(mirror.a, object.a);
			assert.notEqual(mirror.b, object.b);
		}), 100);
	},

	'.destroy()'() {
		const dfd = this.async(5000);
		const object = { a: 1 };

		const observer = observe({
			target: object,
			listener: dfd.rejectOnError(function (events: PropertyEvent[]): any {
				assert(true);
			})
		});

		observer.destroy();
		object.a += 1;

		setTimeout(dfd.callback(function () {}), 100);
	}
});
