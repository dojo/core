import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import DateObject, { IntervalDescriptor } from 'src/DateObject';

var date: Date;
var object: DateObject;

const now = new DateObject();
const aSecondAgo = now.add({ seconds: -1 });
const aMinuteAgo = now.add({ minutes: -1 });
const anHourAgo = now.add({ hours: - 1 });
const aDayAgo = now.add({ dayOfMonth: - 1 });
const aMonthAgo = now.add({ dayOfMonth: -30 });
const aYearAgo = now.add({ dayOfMonth: -365 });

registerSuite({
	name: 'DateObject',

	'creation': function () {
		var date = new Date();
		var object = new DateObject();

		assert.closeTo(object.valueOf(), +date, 100);

		object = new DateObject(date);
		assert.strictEqual(object.valueOf(), +date);

		object = new DateObject(+date);
		assert.strictEqual(object.valueOf(), +date);

		object = new DateObject(date.toISOString());
		assert.strictEqual(object.valueOf(), +date);

		object = new DateObject({
			year: date.getFullYear(),
			month: date.getMonth() + 1
		});
		date.setDate(1);
		date.setHours(0, 0, 0, 0);
		assert.strictEqual(object.valueOf(), +date);
	},

	'properties': {
		beforeEach: function () {
			date = new Date();
			object = new DateObject(date);
		},

		'year': function () {
			assert.strictEqual(object.year, date.getFullYear());
			date.setFullYear(object.year = 1);
			assert.strictEqual(object.year, date.getFullYear());

			object = new DateObject({ year: 2005, month: 12, dayOfMonth: 27 });
			object.year += 1;
			assert.strictEqual(+object, +new Date(2006, 11, 27));

			object = new DateObject({ year: 2005, month: 12, dayOfMonth: 27 });
			object.year -= 1;
			assert.strictEqual(+object, +new Date(2004, 11, 27));

			object = new DateObject({ year: 2000, month: 2, dayOfMonth: 29 });
			object.year += 1;
			assert.strictEqual(+object, +new Date(2001, 1, 28));

			object = new DateObject({ year: 2000, month: 2, dayOfMonth: 29 });
			object.year += 5;
			assert.strictEqual(+object, +new Date(2005, 1, 28));

			object = new DateObject({ year: 1900, month: 12, dayOfMonth: 31 });
			object.year += 30;
			assert.strictEqual(+object, +new Date(1930, 11, 31));

			object = new DateObject({ year: 1995, month: 12, dayOfMonth: 31 });
			object.year += 35;
			assert.strictEqual(+object, +new Date(2030, 11, 31));
		},

		'month': function () {
			assert.strictEqual(object.month, date.getMonth() + 1);
			date.setMonth((object.month = 1) - 1);
			assert.strictEqual(object.month, date.getMonth() + 1);

			object = new DateObject({ year: 2000, month: 1, dayOfMonth: 1 });
			object.month += 1;
			assert.strictEqual(+object, +new Date(2000, 1, 1));

			object = new DateObject({ year: 2000, month: 1, dayOfMonth: 31 });
			object.month += 1;
			assert.strictEqual(+object, +new Date(2000, 1, 29));

			object = new DateObject({ year: 2000, month: 2, dayOfMonth: 29 });
			object.month += 12;
			assert.strictEqual(+object, +new Date(2001, 1, 28));
		},

		'dayOfMonth': function () {
			assert.strictEqual(object.dayOfMonth, date.getDate());
			date.setDate(object.dayOfMonth = 1);
			assert.strictEqual(object.dayOfMonth, date.getDate());
		},

		'hours': function () {
			assert.strictEqual(object.hours, date.getHours());
			date.setHours(object.hours = 12);
			assert.strictEqual(object.hours, date.getHours());
		},

		'minutes': function () {
			assert.strictEqual(object.minutes, date.getMinutes());
			date.setMinutes(object.minutes = 12);
			assert.strictEqual(object.minutes, date.getMinutes());
		},

		'seconds': function () {
			assert.strictEqual(object.seconds, date.getSeconds());
			date.setSeconds(object.seconds = 12);
			assert.strictEqual(object.seconds, date.getSeconds());
		},

		'milliseconds': function () {
			assert.strictEqual(object.milliseconds, date.getMilliseconds());
			date.setMilliseconds(object.milliseconds = 12);
			assert.strictEqual(object.milliseconds, date.getMilliseconds());
		},

		'time': function () {
			assert.strictEqual(object.time, +date);
			date.setTime(object.time = 0);
			assert.strictEqual(object.time, +date);
		},

		'dayOfWeek': function () {
			assert.strictEqual(object.dayOfWeek, date.getDay());
		},

		'timezoneOffset': function () {
			assert.strictEqual(object.timezoneOffset, date.getTimezoneOffset());
		},

		utc: function () {
			// TODO implement
		}
	},

	'.to* methods': function () {
		var date = new Date();
		var object = new DateObject(date);

		assert.strictEqual(object.toString(), date.toString());
		assert.strictEqual(object.toDateString(), date.toDateString());
		assert.strictEqual(object.toTimeString(), date.toTimeString());
		assert.strictEqual(object.toLocaleString(), date.toLocaleString());
		assert.strictEqual(object.toLocaleDateString(), date.toLocaleDateString());
		assert.strictEqual(object.toLocaleTimeString(), date.toLocaleTimeString());
		assert.strictEqual(object.toISOString(), date.toISOString());
		assert.strictEqual(object.toJSON(), date.toJSON());
	},

	'.add': function () {
		var object1: DateObject;
		var object2: DateObject;

		// year
		object1 = new DateObject({ year: 2005, month: 12, dayOfMonth: 27 });
		object2 = object1.add({ year: 1 });
		assert.notStrictEqual(object1, object2);
		assert.strictEqual(+object2, +new Date(2006, 11, 27));

		object1 = new DateObject({ year: 2005, month: 12, dayOfMonth: 27 });
		object2 = object1.add({ year: -1 });
		assert.notStrictEqual(object1, object2);
		assert.strictEqual(+object2, +new Date(2004, 11, 27));

		object1 = new DateObject({ year: 2000, month: 2, dayOfMonth: 29 });
		object2 = object1.add({ year: 1 });
		assert.notStrictEqual(object1, object2);
		assert.strictEqual(+object2, +new Date(2001, 1, 28));

		object1 = new DateObject({ year: 2000, month: 2, dayOfMonth: 29 });
		object2 = object1.add({ year: 5 });
		assert.notStrictEqual(object1, object2);
		assert.strictEqual(+object2, +new Date(2005, 1, 28));

		object1 = new DateObject({ year: 1900, month: 12, dayOfMonth: 31 });
		object2 = object1.add({ year: 30 });
		assert.notStrictEqual(object1, object2);
		assert.strictEqual(+object2, +new Date(1930, 11, 31));

		object1 = new DateObject({ year: 1995, month: 12, dayOfMonth: 31 });
		object2 = object1.add({ year: 35 });
		assert.notStrictEqual(object1, object2);
		assert.strictEqual(+object2, +new Date(2030, 11, 31));

		// month
		object1 = new DateObject({ year: 2000, month: 1, dayOfMonth: 1 });
		object2 = object1.add({ month: 1 });
		assert.notStrictEqual(object1, object2);
		assert.strictEqual(+object2, +new Date(2000, 1, 1));

		object1 = new DateObject({ year: 2000, month: 1, dayOfMonth: 31 });
		object2 = object1.add({ month: 1 });
		assert.notStrictEqual(object1, object2);
		assert.strictEqual(+object2, +new Date(2000, 1, 29));

		object1 = new DateObject({ year: 2000, month: 2, dayOfMonth: 29 });
		object2 = object1.add({ month: 12 });
		assert.notStrictEqual(object1, object2);
		assert.strictEqual(+object2, +new Date(2001, 1, 28));

		// TODO: test multiple at once
	},

	'isLeapYear': function () {
		var date = new DateObject({
			year: 2006,
			month: 1,
			dayOfMonth: 1
		});

		assert.isFalse(date.isLeapYear);
		date.year = 2004;
		assert.isTrue(date.isLeapYear);
		date.year = 2000;
		assert.isTrue(date.isLeapYear);
		date.year = 1900;
		assert.isFalse(date.isLeapYear);
		date.year = 1800;
		assert.isFalse(date.isLeapYear);
		date.year = 1700;
		assert.isFalse(date.isLeapYear);
		date.year = 1600;
		assert.isTrue(date.isLeapYear);
	},

	'daysInMonth': function () {
		var date = new DateObject({
			year: 2006,
			month: 1,
			dayOfMonth: 1
		});

		assert.strictEqual(date.daysInMonth, 31);
		date.month = 2;
		assert.strictEqual(date.daysInMonth, 28);
		date.month = 3;
		assert.strictEqual(date.daysInMonth, 31);
		date.month = 4;
		assert.strictEqual(date.daysInMonth, 30);
		date.month = 5;
		assert.strictEqual(date.daysInMonth, 31);
		date.month = 6;
		assert.strictEqual(date.daysInMonth, 30);
		date.month = 7;
		assert.strictEqual(date.daysInMonth, 31);
		date.month = 8;
		assert.strictEqual(date.daysInMonth, 31);
		date.month = 9;
		assert.strictEqual(date.daysInMonth, 30);
		date.month = 10;
		assert.strictEqual(date.daysInMonth, 31);
		date.month = 11;
		assert.strictEqual(date.daysInMonth, 30);
		date.month = 12;
		assert.strictEqual(date.daysInMonth, 31);

		// Februarys
		date.month = 2;
		date.year = 2004;
		assert.strictEqual(date.daysInMonth, 29);
		date.year = 2000;
		assert.strictEqual(date.daysInMonth, 29);
		date.year = 1900;
		assert.strictEqual(date.daysInMonth, 28);
		date.year = 1800;
		assert.strictEqual(date.daysInMonth, 28);
		date.year = 1700;
		assert.strictEqual(date.daysInMonth, 28);
		date.year = 1600;
		assert.strictEqual(date.daysInMonth, 29);
	},

	comparisons: (function () {
		var younger = new DateObject(new Date(2012, 0, 31, 23, 55));
		var older = new DateObject(new Date(2010, 7, 26, 4 , 15));

		return {
			compare: {
				'if date is newer than comparison: return positive': function () {
					assert.isTrue(younger.compare(older) > 0);
				},

				'if date is less recent than comparison: return negative': function () {
					assert.isTrue(older.compare(younger) < 0);
				},

				'if dates are identical: return 0': function () {
					assert.strictEqual(younger.compare(younger), 0);
				}
			},

			compareDate: function () {
				var similarDate1 = new DateObject(new Date(1979, 2, 20, 2, 4, 6));
				var similarDate2 = new DateObject(new Date(1979, 2, 20, 1, 3, 5));

				assert.strictEqual(similarDate1.compareDate(similarDate2), 0);
			},

			compareTime:  function () {
				var similarTime1 = new DateObject(new Date(2015, 1, 1, 2, 4, 6));
				var similarTime2 = new DateObject(new Date(1977, 3, 20, 2, 4, 6));

				assert.strictEqual(similarTime1.compareTime(similarTime2), 0);
			},
		};
	})(),

	difference: {
		milliseconds: function () {
			const MILLISECONDS_IN_SECOND = 1000;
			const MILLISECONDS_IN_MINUTE = 60 * MILLISECONDS_IN_SECOND;
			const MILLISECONDS_IN_HOUR = 60 * MILLISECONDS_IN_MINUTE;
			const MILLISECONDS_IN_DAY = 24 * MILLISECONDS_IN_HOUR;

			assert.strictEqual(now.difference(aSecondAgo), -MILLISECONDS_IN_SECOND);
			assert.strictEqual(now.difference(aMinuteAgo), -MILLISECONDS_IN_MINUTE);
			assert.strictEqual(now.difference(anHourAgo), -MILLISECONDS_IN_HOUR);
			assert.strictEqual(now.difference(aDayAgo), -MILLISECONDS_IN_DAY);
			assert.strictEqual(now.difference(aMonthAgo), -30 * MILLISECONDS_IN_DAY);
			assert.strictEqual(now.difference(aYearAgo), -365 * MILLISECONDS_IN_DAY);
		},

		seconds: function () {
			const SECONDS_IN_AN_HOUR = 3600;
			const SECONDS_IN_A_DAY = 24 * SECONDS_IN_AN_HOUR;

			assert.strictEqual(now.difference(aSecondAgo, IntervalDescriptor.Second), -1);
			assert.strictEqual(now.difference(aMinuteAgo, IntervalDescriptor.Second), -60);
			assert.strictEqual(now.difference(anHourAgo, IntervalDescriptor.Second), -SECONDS_IN_AN_HOUR);
			assert.strictEqual(now.difference(aDayAgo, IntervalDescriptor.Second), -SECONDS_IN_A_DAY);
			assert.strictEqual(now.difference(aMonthAgo, IntervalDescriptor.Second), -30 * SECONDS_IN_A_DAY);
			assert.strictEqual(now.difference(aYearAgo, IntervalDescriptor.Second), -365 * SECONDS_IN_A_DAY);
		},

		minutes: function () {
			const MINUTES_IN_A_DAY = 60 * 24;

			assert.strictEqual(now.difference(aSecondAgo, IntervalDescriptor.Minute), 0);
			assert.strictEqual(now.difference(aMinuteAgo, IntervalDescriptor.Minute), -1);
			assert.strictEqual(now.difference(anHourAgo, IntervalDescriptor.Minute), -60);
			assert.strictEqual(now.difference(aDayAgo, IntervalDescriptor.Minute), -MINUTES_IN_A_DAY);
			assert.strictEqual(now.difference(aMonthAgo, IntervalDescriptor.Minute), -30 * MINUTES_IN_A_DAY);
			assert.strictEqual(now.difference(aYearAgo, IntervalDescriptor.Minute), -365 * MINUTES_IN_A_DAY);
		},

		hours: function () {
			assert.strictEqual(now.difference(aSecondAgo, IntervalDescriptor.Hour), 0);
			assert.strictEqual(now.difference(aMinuteAgo, IntervalDescriptor.Hour), 0);
			assert.strictEqual(now.difference(anHourAgo, IntervalDescriptor.Hour), -1);
			assert.strictEqual(now.difference(aDayAgo, IntervalDescriptor.Hour), -24);
			assert.strictEqual(now.difference(aMonthAgo, IntervalDescriptor.Hour), -30 * 24);
			assert.strictEqual(now.difference(aYearAgo, IntervalDescriptor.Hour), -365 * 24);
		},

		days: function () {
			assert.strictEqual(now.difference(aSecondAgo, IntervalDescriptor.Day), 0);
			assert.strictEqual(now.difference(aMinuteAgo, IntervalDescriptor.Day), 0);
			assert.strictEqual(now.difference(anHourAgo, IntervalDescriptor.Day), 0);
			assert.strictEqual(now.difference(aDayAgo, IntervalDescriptor.Day), -1);
			assert.strictEqual(now.difference(aMonthAgo, IntervalDescriptor.Day), -30);
			assert.strictEqual(now.difference(aYearAgo, IntervalDescriptor.Day), -365);
		},

		months: {
			'same months': function () {
				var noDifference = new DateObject({ year: 2000, month: 1, dayOfMonth: 1 })
					.difference(new DateObject({ year: 2000, month: 1, dayOfMonth: 30 }), IntervalDescriptor.Month);

				assert.strictEqual(noDifference, 0);
			},

			'a month difference': function () {
				var monthDifference = new DateObject({ year: 2000, month: 1 })
					.difference(new DateObject({ year: 2000, month: 2 }), IntervalDescriptor.Month);

				assert.strictEqual(monthDifference, 1);
			},

			'greater than a year': function () {
				var difference = new DateObject({ year: 2000, month: 1 })
					.difference(new DateObject({ year: 2001, month: 2 }), IntervalDescriptor.Month);

				assert.strictEqual(difference, 13);
			}
		},

		years: {
			'same year': function () {
				var difference = new DateObject({ year: 2000, month: 1, dayOfMonth: 1 })
					.difference(new DateObject({ year: 2000, month: 12, dayOfMonth: 31 }), IntervalDescriptor.Year);

				assert.strictEqual(difference, 0);
			},

			'different years': function () {
				var difference = new DateObject({ year: 2000, month: 1, dayOfMonth: 1 })
					.difference(new DateObject({ year: 2001, month: 1, dayOfMonth: 1 }), IntervalDescriptor.Year);

				assert.strictEqual(difference, 1);
			}
		}
	}
});
