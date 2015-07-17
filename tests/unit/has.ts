import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import has, { add as hasAdd, cache as hasCache } from 'src/has';

let alreadyCached: { [key: string]: boolean } = {};

registerSuite({
		name: 'has',

		// Run cache tests first to validate assumptions made for cleanup in other tests
		'has cache': {

			teardown() {
				delete hasCache['abc'];
				delete hasCache['def'];
				delete hasCache['deferred-cache'];
			},

			'basic true/false tests'() {
				hasAdd('abc', true);
				assert.isTrue(hasCache['abc']);
				hasAdd('def', false);
				assert.isFalse(hasCache['def']);

				delete hasCache['abc'];
				assert.isUndefined(has('abc'), 'Feature should be undefined after being removed from cache');
			},

			'deferred feature test should not populate cache until evaluated'() {
				hasAdd('deferred-cache', function () {
					return true;
				});
				assert.notProperty(hasCache, 'deferred-cache');
				has('deferred-cache');
				assert.property(hasCache, 'deferred-cache');
			}
		},

		'adding feature detections': {
			setup() {
				Object.keys(hasCache).forEach(function (key) {
					alreadyCached[key] = true;
				});
			},

			afterEach() {
				Object.keys(hasCache).forEach(function (key) {
					if (!alreadyCached[key]) {
						delete hasCache[key];
					}
				});
			},

			'basic tests with immediate values'() {
				hasAdd('foo', true);
				hasAdd('bar', false);

				assert.isTrue(has('foo'));
				assert.isFalse(has('bar'));
			},

			'deferred feature test evaluation'() {
				let value = false;
				hasAdd('deferred', function () {
					return value;
				});

				value = true;
				assert.isTrue(has('deferred'),
					'Test function should not be run until the first time has is called for that feature');
			},

			'tests should not coerce'() {
				let answer = 42;

				hasAdd('answer', answer);
				assert.strictEqual(has('answer'), answer,
					'has feature should report original uncoerced value');

				hasAdd('answer-function', function () {
					return answer;
				});
				assert.strictEqual(has('answer-function'), answer,
					'deferred has feature test should report uncoerced value');
			},

			'null test should not throw'() {
				assert.doesNotThrow(function () {
					hasAdd('baz', null);
				}, TypeError);
			},

			'overwrite'() {
				hasAdd('one', false);
				assert.isFalse(has('one'));
				hasAdd('one', true, true);
				assert.isTrue(has('one'));
			}
		},

		'has loader tests': {

			teardown() {
				delete hasCache['abc'];
				delete hasCache['def'];
			},

			'both feature and no-feature modules provided'() {
				const featureModule = require('intern');
				const noFeatureModule = require('intern!object');

				let hostBrowser = require('src/has!host-browser?intern:intern!object');
				let hostNode = require('src/has!host-node?intern:intern!object');

				if (has('host-browser')) {
					assert.strictEqual(hostBrowser, featureModule);
					assert.strictEqual(hostNode, noFeatureModule);
				}
				else if (has('host-node')){
					assert.strictEqual(hostBrowser, noFeatureModule);
					assert.strictEqual(hostNode, featureModule);
				}
			},

			'only feature module provided'() {
				let result: any;
				let noResult: any;

				if (has('host-browser')) {
					result = require('src/has!host-browser?intern');
					noResult = require('src/has!host-node?intern');
				}
				else if (has('host-node')) {
					result = require('src/has!host-node?intern');
					noResult = require('src/has!host-browser?intern');
				}

				assert.isDefined(result);
				assert.isUndefined(noResult);
			},

			'only no-feature module provided'() {
				let result: any;
				let noResult: any;

				if (has('host-browser')) {
					result = require('src/has!host-node?:intern');
					noResult = require('src/has!host-browser?:intern');
				}
				else if (has('host-node')){
					result = require('src/has!host-browser?:intern');
					noResult = require('src/has!host-node?:intern');
				}

				assert.isDefined(result);
				assert.isUndefined(noResult);
			},

			'custom has test'() {
				const featureModule = require('intern');
				const noFeatureModule = require('intern!object');

				hasAdd('abc', true);
				hasAdd('def', false);

				var result1 = require('src/has!abc?intern:intern!object');
				assert.strictEqual(result1, featureModule);

				var result2 = require('src/has!def?intern:intern!object');
				assert.strictEqual(result2, noFeatureModule);
			}
		}
	}
);
