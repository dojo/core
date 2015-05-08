import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import on, { emit } from 'src/on';
import {Handle} from 'src/interfaces';

var handles: Handle[] = [];
function testOn(...args: any[]) {
	var handle = on.apply(null, arguments);
	handles.push(handle);
	return handle;
};

function cleanUpListeners(): void {
	while (handles.length > 0) {
		handles.pop().destroy();
	}
}

interface CustomEvent {
	type: string;
	value?: string;
	cancelable?: boolean;
	preventDefault?: () => void;
}

function createCommonTests(args: any) {
	var target: any,
		testEventName: string = args.eventName;

	return {
		beforeEach() {
			target = args.createTarget();
		},

		afterEach() {
			cleanUpListeners();
			args.destroyTarget && args.destroyTarget(target);
		},

		'on and emit'() {
			var listenerCallCount = 0,
				emittedEvent: CustomEvent;

			testOn(target, testEventName, function (actualEvent: CustomEvent) {
				listenerCallCount++;
				assert.strictEqual(actualEvent.value, emittedEvent.value);
			});

			emittedEvent = { value: 'foo', type: testEventName };
			emit(target, emittedEvent);
			assert.strictEqual(listenerCallCount, 1);

			emittedEvent = { value: 'bar', type: testEventName };
			emit(target, emittedEvent);
			assert.strictEqual(listenerCallCount, 2);
		},

		'.emit return value'() {
<<<<<<< HEAD
			var returnValue = emit(target, { type: testEventName, cancelable: false });
			assert.ok(returnValue);
			assert.propertyVal(returnValue, 'cancelable', false);

			returnValue = emit(target, { type: testEventName, cancelable: true });
			assert.ok(returnValue);
			assert.propertyVal(returnValue, 'cancelable', true);

			testOn(target, testEventName, function (event: CustomEvent) {
				if ('preventDefault' in event) {
					event.preventDefault();
				}
				else {
					event.cancelable = false;
				}
			});
			assert.isFalse(emit(target, { type: testEventName, cancelable: true }));
=======
			// var returnValue = emit(target, { type: testEventName, cancelable: false });
			// assert.ok(returnValue);
			// assert.propertyVal(returnValue, 'cancelable', false);
			//
			// returnValue = emit(target, { type: testEventName, cancelable: true });
			// assert.ok(returnValue);
			// assert.propertyVal(returnValue, 'cancelable', true);
			//
			// testOn(target, testEventName, function (event: CustomEvent) {
			// 	if ('preventDefault' in event) {
			// 		event.preventDefault();
			// 	}
			// 	else {
			// 		event.cancelable = false;
			// 	}
			// });
			// assert.isFalse(emit(target, { type: testEventName, cancelable: true }));
>>>>>>> on tests for using Evented
		},

		'on - multiple event names'() {
			var listenerCallCount = 0,
				emittedEventType: string,
				emittedEvent: CustomEvent;

<<<<<<< HEAD
			testOn(target, 'test1, test2', function (actualEvent: CustomEvent) {
=======
			testOn(target, ['test1', 'test2'], function (actualEvent: CustomEvent) {
>>>>>>> on tests for using Evented
				listenerCallCount++;
				if (emittedEventType in actualEvent) {
					assert.strictEqual(actualEvent.type, emittedEventType);
				}
				assert.strictEqual(actualEvent.value, emittedEvent.value);
			});

			emittedEventType = 'test1';
			emittedEvent = { type: emittedEventType, value: 'foo' };
			emit(target, emittedEvent);
			assert.strictEqual(listenerCallCount, 1);

			emittedEventType = 'test2';
			emittedEvent = { type: emittedEventType, value: 'bar' };
			emit(target, emittedEvent);
			assert.strictEqual(listenerCallCount, 2);
		},

		'on - multiple handlers'() {
			var order: any[] = [];
<<<<<<< HEAD
			testOn(target, 'a, b', function (event: CustomEvent) {
				order.push(1 + event.type);
			});
=======
			var customEvent = function (target: any, listener: any) {
				return on(target, 'custom', listener);
			};
			on(target, ['a', 'b'], function (event) {
				order.push(1 + event.type);
			});
			on(target, [ 'a', customEvent ], function (event) {
				order.push(2 + event.type);
			});
>>>>>>> on tests for using Evented
			emit(target, { type: 'a' });
			emit(target, { type: 'b' });
			emit(target, { type: 'custom' });
			assert.deepEqual(order, [ '1a', '2a', '1b', '2custom' ]);
		},

		'on - extension events'() {
			var listenerCallCount = 0,
				emittedEvent: any,
				extensionEvent = function (target: any, listener: any) {
					return testOn(target, testEventName, listener);
				};

			testOn(target, extensionEvent, function (actualEvent: CustomEvent) {
				listenerCallCount++;
				assert.strictEqual(actualEvent.value, emittedEvent.value);
			});

			emittedEvent = { type: testEventName, value: 'foo' };
			emit(target, emittedEvent);
			assert.strictEqual(listenerCallCount, 1);

			emittedEvent = { type: testEventName, value: 'bar' };
			emit(target, emittedEvent);
			assert.strictEqual(listenerCallCount, 2);
		}
	};
}

<<<<<<< HEAD
// var suite = {
// 	name: 'dojo/on',
//
// 	common: {
// 		'object events': createCommonTests({
// 			eventName: 'test',
// 			createTarget: function () {
// 				return new Evented();
// 			}
// 		})
// 	},
//
// 	'cannot target non-emitter': function () {
// 		var threwError = false;
// 		try {
// 			var nonEmitter = {};
// 			testOn(nonEmitter, 'test', function () {});
// 		}
// 		catch (err) {
// 			threwError = true;
// 		}
// 		assert.isTrue(threwError);
// 	}
// };
=======
var suite = {
	name: 'on',

	common: {
		'object events': createCommonTests({
			eventName: 'test',
			createTarget: function () {
				return new Evented();
			}
		})
	},

	'cannot target non-emitter': function () {
		assert.throws(function () {
			testOn({}, 'test', function () {});
		});
	}
};
>>>>>>> on tests for using Evented

// registerSuite(suite);
