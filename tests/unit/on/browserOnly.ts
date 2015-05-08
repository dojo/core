import common from './common';
import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import on from 'src/on';
import Evented from 'src/Evented';

registerSuite({
	name: 'on',

	'DOM events': common({
		eventName: 'test',
		createTarget: function () {
			var element = document.createElement('div');
			document.appendChild(element);
			return element;
		},
		destroyTarget: function (target: HTMLElement) {
			target.parentNode.removeChild(target);
		}
	})
});
