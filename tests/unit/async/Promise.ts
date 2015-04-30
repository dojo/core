import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import Promise, { State } from 'src/async/Promise';
import { addPromiseTests } from '../Promise';

let suite = {
	name: 'Promise',

	'class type': function () {
		assert.instanceOf(Promise.all([]), Promise);
		assert.instanceOf(Promise.race([]), Promise);
		assert.instanceOf(Promise.resolve(0), Promise);
		assert.instanceOf(Promise.reject(new Error('foo')), Promise);
	},

	'#finally': {
		'called for resolved Promise': function () {
			let dfd = this.async();
			Promise.resolve(5).finally(dfd.callback(() => {}));
		},

		'called for rejected Promise': function () {
			let dfd = this.async();
			Promise.reject(5).finally(dfd.callback(() => {}));
		},

		'value passes through': function () {
			let dfd = this.async();
			Promise.resolve(5).finally(() => {}).then(dfd.callback((value: any) => assert.strictEqual(value, 5)));
		},

		'rejection passes through': function () {
			let dfd = this.async();
			Promise.reject(new Error('foo')).finally(() => {}).then(
				dfd.rejectOnError(() => assert(false, 'Should not have resolved')),
				dfd.callback((reason: any) => assert.propertyVal(reason, 'message', 'foo'))
			);
		},

		'returned value is ignored': function () {
			let dfd = this.async();
			Promise.resolve(5).finally((): any => {
				return 4;
			}).then(
				dfd.callback((value: any) => assert.strictEqual(value, 5)),
				dfd.rejectOnError(() => assert(false, 'Should not have rejected'))
			);
		},

		'returned resolved promise is ignored': function () {
			let dfd = this.async();
			Promise.resolve(5).finally((): any => {
				return Promise.resolve(4);
			}).then(
				dfd.callback((value: any) => assert.strictEqual(value, 5)),
				dfd.rejectOnError(() => assert(false, 'Should not have rejected'))
			);
		},

		'thrown error rejects': function () {
			let dfd = this.async();
			Promise.resolve(5).finally(() => {
				throw new Error('foo');
			}).then(
				dfd.rejectOnError((value: any) => assert(false, 'Should not have rejected')),
				dfd.callback((reason: any) => assert.propertyVal(reason, 'message', 'foo'))
			);
		},

		'returned rejected promise rejects': function () {
			let dfd = this.async();
			Promise.resolve(5).finally(() => {
				return Promise.reject('foo');
			}).then(
				dfd.rejectOnError((value: any) => assert(false, 'Should not have rejected')),
				dfd.callback((reason: any) => assert.strictEqual(reason, 'foo'))
			);
		}
	},

	'state inspection': {
		pending: function () {
			let promise = new Promise((resolve, reject) => {});
			assert.strictEqual(promise.state, State.Pending);
		},

		resolved: function () {
			let dfd = this.async();
			let promise = new Promise((resolve, reject) => {
				resolve(5);
			});
			promise.then(dfd.callback(() => assert.strictEqual(promise.state, State.Fulfilled)));
		},

		rejected: function () {
			let dfd = this.async();
			var promise = Promise.reject(5);
			promise.catch(dfd.callback(() => assert.strictEqual(promise.state, State.Rejected)));
		}
	}
};

// ensure extended promise passes all the standard Promise tests
addPromiseTests(suite, Promise);

registerSuite(suite);
