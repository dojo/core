import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import sinon = require('sinon');
import { Handle } from 'src/interfaces';
import * as util from 'src/util';

registerSuite({
		name: 'utility functions',

		'debounce': {
			'debounces callbacks'() {
				let spy = sinon.spy();
				let debouncer = util.debounce(spy, 100);

				debouncer();

				setTimeout(function () {
					debouncer();
				}, 90);

				setTimeout(function () {
					debouncer();
				}, 180);

				setTimeout(this.async().callback(function () {
					assert.equal(spy.callCount, 1);
				}), 300);
			},

			'allows callbacks after cool off period'() {
				let spy = sinon.spy();
				let debouncer = sinon.spy(util.debounce(spy, 100));

				debouncer();

				setTimeout(function () {
					debouncer();
				}, 110);

				setTimeout(function () {
					debouncer();
				}, 220);

				setTimeout(this.async().callback(function () {
					assert.equal(spy.callCount, 3);
				}), 350);
			},

			'no delay provided'() {
				let called: boolean;
				let debouncer = util.debounce(function () {
					called = true;
				});
				debouncer();
				
				setTimeout(this.async().callback(function () {
					assert.isTrue(called);
				}), 1);
			}
		},

		'throttle': {
			'throttles callbacks'() {
				let spy = sinon.spy();
				let throttler = sinon.spy(util.throttle(spy, 100));

				throttler();
				setTimeout(function () {
					throttler();
					throttler();
					throttler();
				}, 90);

				setTimeout(this.async().callback(function () {
					assert.strictEqual(spy.callCount, 1);
				}), 150);
			},

			'allows throttled callbacks'() {
				let spy = sinon.spy();
				let throttler = sinon.spy(util.throttle(spy, 100));

				throttler();

				setTimeout(function () {
					throttler();
				}, 110);

				setTimeout(function () {
					throttler();
				}, 220);


				setTimeout(this.async().callback(function () {
					assert.equal(spy.callCount, 3);
				}), 250);
			}
		},

		'throttleAfter': {
			'throttles callbacks'() {
				let spy = sinon.spy();
				let throttler = sinon.spy(util.throttleAfter(spy, 100));

				throttler();
				setTimeout(function () {
					throttler();
					throttler();
					throttler();
				}, 90);

				setTimeout(this.async().callback(function () {
					assert.strictEqual(spy.callCount, 1);
				}), 150);
			},

			'allows throttled callbacks'() {
				let spy = sinon.spy();
				let throttler = sinon.spy(util.throttleAfter(spy, 100));

				throttler();

				setTimeout(function () {
					throttler();
				}, 110);

				setTimeout(function () {
					throttler();
				}, 220);


				setTimeout(this.async().callback(function () {
					assert.equal(spy.callCount, 2);
				}), 250);
			}
		},

		'createTimer': (function () {
			let timer: Handle;

			return {
				afterEach() {
					timer && timer.destroy();
					timer = null;
				},
				
				'handle destruction'() {
					let spy = sinon.spy();
					timer = util.createTimer(spy, 100);

					setTimeout(function () {
						timer.destroy();
					}, 50);

					setTimeout(this.async().callback(function () {
						assert.strictEqual(spy.callCount, 0);
					}), 110);
				},

				'timeout'() {
					let spy = sinon.spy();
					timer = util.createTimer(spy, 100);

					setTimeout(this.async().callback(function () {
						assert.strictEqual(spy.callCount, 1);
					}), 110);
				}
			}
		})(),

		'createInterval': (function () {
			let interval: Handle;

			return {
				afterEach() {
					interval && interval.destroy();
					interval = null;
				},
				
				'handle destruction'() {
					let spy = sinon.spy();
					interval = util.createInterval(spy, 100);

					setTimeout(function () {
						interval.destroy();
					}, 50);

					setTimeout(this.async().callback(function () {
						assert.strictEqual(spy.callCount, 0);
					}), 110);
				},

				'interval'() {
					let spy = sinon.spy();
					interval = util.createInterval(spy, 100);

					setTimeout(this.async().callback(function () {
						assert.strictEqual(spy.callCount, 1);
					}), 110);

					setTimeout(this.async().callback(function () {
						assert.strictEqual(spy.callCount, 2);
					}), 220);
				}
			}
		})(),
	}
);
