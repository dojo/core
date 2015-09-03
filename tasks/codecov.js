/* jshint node:true */

var sendToCodeCov = require('codecov.io/lib/sendToCodeCov.io');

module.exports = function (grunt) {
	grunt.registerTask('codecov', function () {
		var done = this.async();

		var contents = grunt.file.read('coverage-final.xml');
		sendToCodeCov(contents, function (err) {
			done(err);
		});
	});
};
