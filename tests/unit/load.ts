import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import has from 'src/has';
import load from 'src/load';
import Promise from 'src/Promise';

const suite: any = {
	name: 'load',

	load() {
		var def = this.async(5000);

		load(require, './load/a', './load/b').then(def.callback(function ([ a, b ]: [ any, any ]) {
			assert.deepEqual(a, { one: 1, two: 2 });
			assert.deepEqual(b, { three: 3, four: 4 });
		}));
	}
};

if (has('host-node')) {
	const nodeRequire: any = global.require.nodeRequire;
	const path: any = nodeRequire('path');
	const buildDir: string = path.join(process.cwd(), '_build');

	suite.node = {
		'different than AMD load'() {
			const nodeLoad: typeof load = nodeRequire(path.join(buildDir, 'src', 'load')).default;
			assert.notStrictEqual(nodeLoad, load);
		},

		'load succeeds'() {
			var def = this.async(5000);

			var result: Promise<any[]> = nodeRequire(path.join(buildDir, 'tests', 'unit', 'load', 'node')).succeed;
			result.then(def.callback(function ([ a, b ]: [ any, any ]) {
				assert.deepEqual(a, { one: 1, two: 2 });
				assert.deepEqual(b, { three: 3, four: 4 });
			}));
		},

		'load fails'() {
			var def = this.async(5000);

			var result: Promise<any[]> = nodeRequire(path.join(buildDir, 'tests', 'unit', 'load', 'node')).fail;
			result.then(function () {
				def.reject(new Error('load should not have succeeded'));
			}, def.callback(function (error: Error) {
				assert.instanceOf(error, Error);
			}));
		}
	};
}

registerSuite(suite);
