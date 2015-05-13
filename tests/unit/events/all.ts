import common from './common';
import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import on, { emit } from 'src/on';
import Evented from 'src/Evented';

registerSuite({
	name: 'events - Evented',

	'cannot target non-emitter': function () {
		assert.throws(function () {
			on(<any>{}, 'test', function () {});
		});
	},

	'common cases': common({
		eventName: 'test',
		createTarget: function () {
			return new Evented();
		}
	}),

	'emit return value'() {
		var target = new Evented();
		assert.isFalse(emit(target, { type: 'test' }));

		var handle = on(target, 'test', function () {});
		assert.isFalse(emit(target, { type: 'test' }));

		handle.destroy();
	}
});

import 'dojo/has!host-node?./nodeOnly:./browserOnly';
