define([
	'intern/dojo/node!fs',
	'intern/dojo/node!istanbul/lib/collector',
	'intern/dojo/node!istanbul/lib/report/json',
	'intern/dojo/node!istanbul/index'
], function (fs, Collector, Reporter) {
	function JsonCoverageReporter(config) {
		config = config || {};

		this._filename = config.filename || 'coverage-final.json';
		this._collector = new Collector();
		this._reporter = new Reporter({
			file: this._filename,
			watermarks: config.watermarks
		});
	}

	JsonCoverageReporter.prototype.coverage = function (sessionId, coverage) {
		this._collector.add(coverage);
	};

	JsonCoverageReporter.prototype.runEnd = function () {
		if (fs.existsSync(this._filename)) {
			this._collector.add(JSON.parse(fs.readFileSync(this._filename)));
		}
		this._reporter.writeReport(this._collector, true);
	};

	return JsonCoverageReporter;
});
