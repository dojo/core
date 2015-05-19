import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import DateObject, { BasicDate } from 'src/DateObject';
import Duration from 'src/Duration';

var date: Date;
var object: DateObject;

const now = new DateObject();
const aSecondAgo = now.add({ seconds: -1 });
const aMinuteAgo = now.add({ minutes: -1 });
const anHourAgo = now.add({ hours: - 1 });
const aDayAgo = now.add({ dayOfMonth: - 1 });
const aMonthAgo = now.add({ dayOfMonth: -30 });
const aYearAgo = now.add({ dayOfMonth: -365 });

function assertBasicDateEqual(left: BasicDate, right: BasicDate): void {
	assert.strictEqual(left.isLeapYear, right.isLeapYear);
	assert.strictEqual(left.daysInMonth, right.daysInMonth);
	assert.strictEqual(left.year, right.year);
	assert.strictEqual(left.month, right.month);
	assert.strictEqual(left.dayOfMonth, right.dayOfMonth);
	assert.strictEqual(left.hours, right.hours);
	assert.strictEqual(left.minutes, right.minutes);
	assert.strictEqual(left.seconds, right.seconds);
	assert.strictEqual(left.milliseconds, right.milliseconds);
	assert.strictEqual(left.dayOfWeek, right.dayOfWeek);
}

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

		utc: {
			'basic': function () {
				var date = new Date(1979, 2, 20, 7, 20, 12, 123);
				var obj = new DateObject(date);
				var utc = obj.utc;

				assertBasicDateEqual(obj.add(Duration.MINUTE * date.getTimezoneOffset()), utc);
			},

			'leap year': function () {
				var date = new Date(2012, 1, 29, 7, 20, 12, 123);
				var obj = new DateObject(date);
				var utc = obj.utc;

				assertBasicDateEqual(obj.add(Duration.MINUTE * date.getTimezoneOffset()), utc);
			},

			'setters': (function () {
				function assertChange(property: string, value: number = 2) {
					var date = new DateObject();
					var time = date.time;
					var expected: number = (<number> (<any> date.utc)[property]) + value;
					(<any> date.utc)[property] = expected;

					assert.strictEqual((<any> date.utc)[property], expected);
					assert.notEqual(date.time, time);
				}

				return {
					'year': function () {
						assertChange('year');
					},

					'month': function () {
						assertChange('month');
					},

					'dayOfMonth': function () {
						assertChange('dayOfMonth');
					},

					'hours': function () {
						assertChange('hours');
					},

					'minutes': function () {
						assertChange('minutes');
					},

					'seconds': function () {
						assertChange('seconds');
					},

					'milliseconds': function () {
						assertChange('milliseconds');
					}
				}
			})(),

			'toString': function () {
				var date = new DateObject(Date.UTC(1979, 2, 20));
				assert.strictEqual(date.utc.toString(), 'Tue, 20 Mar 1979 00:00:00 GMT');
			}
		}
	},

	'parse': function () {
		var date = DateObject.parse('Tue, 20 Mar 1979 00:00:00');
		assertBasicDateEqual(date, new DateObject(new Date(1979, 2, 20)));
	},

	'now': function () {
		assert.closeTo(DateObject.now().time, Date.now(), 100);
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

	'.add': {
		'DateLike': function () {
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

		'number': function () {
			var date = new DateObject({ year: 2000, month: 2, dayOfMonth: 29 });

			assert.strictEqual(date.add(100).time, date.time + 100);
		},

		'Duration': function () {
			var date = new DateObject({ year: 2000, month: 2, dayOfMonth: 29 });
			var duration = new Duration(100);

			assert.strictEqual(date.add(duration).time, date.time + 100);
		}
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
		'number': function () {
			assert.strictEqual(now.difference(aSecondAgo.time).time, -Duration.SECOND);
			assert.strictEqual(now.difference(aMinuteAgo.time).time, -Duration.MINUTE);
			assert.strictEqual(now.difference(anHourAgo.time).time, -Duration.HOUR);
			assert.strictEqual(now.difference(aDayAgo.time).time, -Duration.DAY);
			assert.strictEqual(now.difference(aMonthAgo.time).time, -30 * Duration.DAY);
			assert.strictEqual(now.difference(aYearAgo.time).time, -365 * Duration.DAY);
		},

		'DateObject': function () {
			assert.strictEqual(now.difference(aSecondAgo).time, -Duration.SECOND);
			assert.strictEqual(now.difference(aMinuteAgo).time, -Duration.MINUTE);
			assert.strictEqual(now.difference(anHourAgo).time, -Duration.HOUR);
			assert.strictEqual(now.difference(aDayAgo).time, -Duration.DAY);
			assert.strictEqual(now.difference(aMonthAgo).time, -30 * Duration.DAY);
			assert.strictEqual(now.difference(aYearAgo).time, -365 * Duration.DAY);
		}
	}
});
