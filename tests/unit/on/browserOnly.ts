import common from './common';
import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import on, { emit } from 'src/on';

function createTarget() {
	var element = document.createElement('div');
	document.appendChild(element);
	return element;
}

function destroyTarget(target: HTMLElement) {
	target.parentNode.removeChild(target);
}

registerSuite({
	name: 'on',

	'DOM events': common({
		eventName: 'test',
		createTarget: createTarget,
		destroyTarget: destroyTarget
	}),

	'.emit return value'() {
		var target = createTarget();
		assert.isFalse(emit(target, { type: 'test' }));

		var handle = on(target, 'test', function (event) {
			event.preventDefault();
		});
		assert.isTrue(emit(target, { type: 'test' }));

		destroyTarget(target);
		handle.destroy();
	}
});
