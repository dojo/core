import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import Duration from 'src/Duration';

var units = ['milliseconds', 'seconds', 'minutes', 'hours', 'days'];

function assertDuration(duration: Duration, ... rest: number[]) {
	for (var i = units.length - 1; i >= 0; i--) {
		var unit = units[i];
		var value = (<any> duration)[unit];
		var expected = (i < rest.length) ? rest[i] : 0;
		assert.strictEqual(value, expected, 'expected ' + unit + ' to be ' + expected + ' for time ' + duration.time);
	}
	return duration;
}

registerSuite({
	name: 'Duration',

	'creation': {
		'default instantiation': function () {
			assertDuration(new Duration(), 0);
		},

		'with milliseconds': function () {
			var expected = 2015;
			var duration = new Duration(expected);
			assert.strictEqual(duration.time, expected);
		},

		'with seconds': function () {
			var milliseconds = 15;
			var seconds = 2;
			var expected = seconds * Duration.SECOND + milliseconds;
			var duration = new Duration(milliseconds, seconds);
			assert.strictEqual(duration.time, expected);
		},

		'with minutes': function () {
			var milliseconds = 15;
			var seconds = 2;
			var minutes = 12;
			var expected = minutes * Duration.MINUTE + seconds * Duration.SECOND + milliseconds;
			var duration = new Duration(milliseconds, seconds, minutes);
			assert.strictEqual(duration.time, expected);
		},

		'with hours': function () {
			var milliseconds = 15;
			var seconds = 2;
			var minutes = 12;
			var hours = 23;
			var expected = hours * Duration.HOUR + minutes * Duration.MINUTE + seconds * Duration.SECOND + milliseconds;
			var duration = new Duration(milliseconds, seconds, minutes, hours);
			assert.strictEqual(duration.time, expected);
		},

		'with days': function () {
			var milliseconds = 15;
			var seconds = 2;
			var minutes = 12;
			var hours = 23;
			var days = 30;
			var expected = days * Duration.DAY + hours * Duration.HOUR + minutes * Duration.MINUTE + seconds * Duration.SECOND + milliseconds;
			var duration = new Duration(milliseconds, seconds, minutes, hours, days);
			assert.strictEqual(duration.time, expected);
		},

		'negative duration': function () {
			var time = -100 - Duration.MINUTE * 30 - Duration.DAY;
			var duration = new Duration(time);
			assertDuration(duration, -100, 0, -30, 0, -1);
		}
	},

	'milliseconds': {
		'less than a second': function () {
			for (var i = 0; i < Duration.SECOND; i++) {
				var duration = new Duration(i);
				assertDuration(duration, i);
			}
		},

		'masks seconds': function () {
			var seconds = 4;
			var milliseconds = 12;
			var duration = new Duration(milliseconds, seconds);
			assertDuration(duration, milliseconds, seconds);
		}
	},

	'seconds': {
		'directly divisible': function () {
			assertDuration(new Duration(0, 10), 0, 10);
		},

		'masks milliseconds': function () {
			assertDuration(new Duration(100, 10), 100, 10);
		},

		'masks minutes': function () {
			assertDuration(new Duration(100, 10, 5), 100, 10, 5);
		}
	},

	'minutes': {
		'directly divisible': function () {
			assertDuration(new Duration(0, 0, 5), 0, 0, 5);
		},

		'masks seconds': function () {
			assertDuration(new Duration(100, 10, 5), 100, 10, 5);
		},

		'masks hours': function () {
			assertDuration(new Duration(100, 20, 5, 20), 100, 20, 5, 20);
		}
	},

	'hours': {
		'directly divisible': function () {
			assertDuration(new Duration(0, 0, 0, 5), 0, 0, 0, 5);
		},

		'masks minutes': function () {
			assertDuration(new Duration(100, 20, 10, 5), 100, 20, 10, 5);
		},

		'masks days': function () {
			assertDuration(new Duration(100, 10, 5, 20, 28), 100, 10, 5, 20, 28);
		}
	},

	'days': {
		'directly divisible': function () {
			assertDuration(new Duration(5, 0, 0, 0, 0), 5, 0, 0, 0);
		},

		'masks hours': function () {
			assertDuration(new Duration(100, 10, 5, 20, 28), 100, 10, 5, 20, 28);
		},
	}
});
