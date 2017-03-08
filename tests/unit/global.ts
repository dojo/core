import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import globalObj from '../../src/global';
import shimGlobal from '@dojo/shim/global';

registerSuite({
	name: 'global',
	'globalObj strictly equals @dojo/shim/global'() {
		assert.strictEqual(globalObj, shimGlobal, 'global objects should be strictly equal');
	}
});
