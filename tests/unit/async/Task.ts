import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import Task from 'src/async/Task';

registerSuite({
	name: 'Task',

	create: function () {
		var dfd = this.async();
		// var t = new Task((resolve, reject) => {}, () => {});
		var resolver: any;
		var t = new Task((resolve, reject) => {
			resolver = resolve;
		}, (): void => {});
		assert.instanceOf(t, Task);
		var n = t.then(dfd.callback((value: any) => console.log('value')));
		assert.instanceOf(n, Task);
		resolver();
	}
});
