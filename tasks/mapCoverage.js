/* jshint node:true */
/* global Promise */

var remap = require('remap-istanbul');

module.exports = function (grunt) {
	grunt.registerMultiTask('mapCoverage', function () {
		var done = this.async();
		var opts = this.options();

		remap(this.filesSrc, opts).then(function () {
			done();
		});
	});
};
