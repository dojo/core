import common from './common';
import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import on, { emit } from 'src/on';

function createTarget() {
	var events = require('events');
	return new events.EventEmitter();
}

registerSuite({
	name: 'on',

	'node events': common({
		eventName: 'test',
		createTarget: createTarget
	}),

	'.emit return value'() {
		var target = createTarget();
		assert.isFalse(emit(target, { type: 'test' }));

		var handle = on(target, 'test', function () {});
		assert.isTrue(emit(target, { type: 'test' }));

		handle.destroy();
	}
});
