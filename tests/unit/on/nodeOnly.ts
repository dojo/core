import common from './common';
import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import on, { emit } from 'src/on';
import { EventEmitter } from 'events';

function createTarget() {
	return new EventEmitter();
}

registerSuite({
	name: 'events - EventEmitter',

	'common cases': common({
		eventName: 'test',
		createTarget: createTarget
	}),

	'emit return value'() {
		const target = createTarget();
		assert.isFalse(emit(target, { type: 'test' }));

		const handle = on(target, 'test', function () {});
		assert.isFalse(emit(target, { type: 'test' }));

		handle.destroy();
	}
});
