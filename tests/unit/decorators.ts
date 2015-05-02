import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import { hidden } from 'src/decorators';

class A {
	@hidden
	foo = 1;
	bar = 2;
	baz = 3;
}

registerSuite({
	name: 'decorators',

	hidden() {
		var a = new A();
		assert.deepEqual(Object.keys(a), [ 'bar', 'baz' ]);
		assert.strictEqual(a.foo, 1);

		a.foo = 4;
		assert.deepEqual(Object.keys(a), [ 'bar', 'baz' ]);
		assert.strictEqual(a.foo, 4);
	}
});
