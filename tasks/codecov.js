/* jshint node:true */

var sendToCodeCov = require('codecov.io/lib/sendToCodeCov.io');

module.exports = function (grunt) {
	grunt.registerMultiTask('codecov', function () {
		var done = this.async();

		if (this.filesSrc.length > 1) {
			grunt.fail.warn('Cannot upload more than one file to codecov.io');
		}
		var contents = grunt.file.read(this.filesSrc[0]);
		sendToCodeCov(contents, function (err) {
			done(err);
		});
	});
};
