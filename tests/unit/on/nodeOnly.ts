import common from './common';
import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import on from 'src/on';
import Evented from 'src/Evented';
import {EventEmitter} from 'events';

registerSuite({
	name: 'on',

	'node events': common({
		eventName: 'test',
		createTarget: function () {
			var events = require('events');
			return new events.EventEmitter();
		}
	})
});
