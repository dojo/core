import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import Registry from 'src/Registry';

registerSuite({
	name: 'Registry',

	'#match': (function () {
		let registry: Registry<any>;
		let handler: Function;

		return {
			beforeEach() {
				registry = new Registry<any>();
				handler = () => {};
			},

			string() {
				registry.register('foo', handler);
				assert.strictEqual(registry.match('foo'), handler);
				assert.throws(() => registry.match('foos'));
				assert.throws(() => registry.match('bar'));
			},

			regexp() {
				registry.register(/^foo/, handler);
				assert.strictEqual(registry.match('foo'), handler);
				assert.strictEqual(registry.match('foos'), handler);
				assert.throws(() => registry.match('bar'));
			},

			'function'() {
				registry.register((name: string) => {
					return name === 'foo';
				}, handler);
				assert.strictEqual(registry.match('foo'), handler);
				assert.throws(() => registry.match('bar'));
			}
		};
	})(),

	'#register': {
		multiple() {
			let registry = new Registry<any>();
			let handler = () => {};
			registry.register(/foo/, handler);
			registry.register(/foo/, () => {});
			assert.strictEqual(registry.match('foo'), handler);
		},

		first() {
			let registry = new Registry<number>();
			registry.register(/foo/, 1);
			registry.register(/foo/, 2, true);
			assert.strictEqual(registry.match('foo'), 2);
			registry.register(/foo/, 3, true);
			assert.notEqual(registry.match('foo'), 2);
		},

		destroy() {
			let registry = new Registry<number>(2);
			let handle = registry.register(/foo/, 1);
			assert.equal(registry.match('foo'), 1);
			handle.destroy();
			assert.equal(registry.match('foo'), 2);

			// check that destroying a second time doesn't throw
			handle.destroy();
		}
	},

	'default value'() {
		let registry = new Registry<any>('foo');
		assert.strictEqual(registry.match('bar'), 'foo');
	}
});
