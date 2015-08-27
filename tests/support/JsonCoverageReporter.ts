import * as fs from 'intern/dojo/node!fs';
import Collector = require('intern/dojo/node!istanbul/lib/collector');
import Reporter = require('intern/dojo/node!istanbul/lib/report/json');
import 'intern/dojo/node!istanbul/index';

class JsonCoverageReporter {
	private _filename: string;
	private _collector: any;
	private _reporter: any;

	constructor(config: any = {}) {
		this._filename = config.filename || 'coverage-final.json';
		this._collector = new Collector();
		this._reporter = new Reporter({
			file: this._filename,
			watermarks: config.watermarks
		});
	}

	coverage(sessionId: string, coverage: any) {
		this._collector.add(coverage);
	}

	runEnd() {
		if (fs.existsSync(this._filename)) {
			this._collector.add(JSON.parse(fs.readFileSync(this._filename, { encoding: 'utf8' })));
		}
		this._reporter.writeReport(this._collector, true);
	}
}

export = JsonCoverageReporter;
