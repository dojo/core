import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import has from 'src/has';
import { get } from 'src/text';

// The exported get function from the text module
// uses fs.readFile on node systems, which resolves
// paths differently than request, which can and
// should be used internally for browser environments.
// As such, this determines the appropriate base path
// for get tests.
let basePath = (function() {
	if (has('host-browser')) {
		return '../../_build/tests/support/data/';
	}
	else if (has('host-node')) {
		return '_build/tests/support/data/';
	}
})();

registerSuite({
		name: 'text',

		'get'() {
			get(basePath + 'correctText.txt').then(this.async().callback(function (text: string) {
				assert.strictEqual(text, 'abc');
			}));
		}
	}
);
