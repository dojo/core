import common from './common';
import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import on, { emit } from 'src/on';

function createTarget() {
	var element = document.createElement('div');
	document.body.appendChild(element);
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
		assert.isTrue(emit(target, { type: 'test' }));

		var handle = on(target, 'test', function (evt) {
			evt.preventDefault();
		});

		assert.isTrue(emit(target, { type: 'test', cancelable: false }));
		assert.isFalse(emit(target, { type: 'test', cancelable: true }));

		destroyTarget(target);
		handle.destroy();
	}
});
