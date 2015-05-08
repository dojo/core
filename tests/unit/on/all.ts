import common from './common';
import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import on from 'src/on';
import Evented from 'src/Evented';

registerSuite({
	name: 'on',

	'cannot target non-emitter': function () {
		assert.throws(function () {
			on(<any>{}, 'test', function () {});
		});
	},

	'object events': common({
		eventName: 'test',
		createTarget: function () {
			return new Evented();
		}
	})
});

import 'dojo/has!host-node?./nodeOnly:./browserOnly';
