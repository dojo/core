/// <reference path="intern/intern.d.ts" />
/// <reference path="benchmark/benchmark.d.ts" />
/// <reference path="sinon/sinon.d.ts" />
/// <reference path="formidable/formidable.d.ts" />
/// <reference path="http-proxy/http-proxy.d.ts" />
/// <reference path="services/echo.d.ts" />

declare module 'intern/dojo/Promise' {
	import Promise = require('dojo/Promise');
	export = Promise;
}

declare module 'intern/dojo/node!fs' {
	import fs = require('fs');
	export = fs;
}

declare module 'istanbul/lib/collector' {
	class Collector {
		add(coverage: any): void;
	}

	export = Collector;
}

declare module 'intern/dojo/node!istanbul/lib/collector' {
	import Collector = require('istanbul/lib/collector');
	export = Collector;
}

declare module 'istanbul/lib/report/json' {
	import Collector = require('istanbul/lib/collector');
	class JsonReporter {
		constructor(options: any);

		writeReport(collector: Collector, sync: boolean): void;
	}
	export = JsonReporter;
}

declare module 'intern/dojo/node!istanbul/lib/report/json' {
	import Reporter = require('istanbul/lib/report/json');
	export = Reporter;
}

declare module 'istanbul/index' {
	let result: any;
	export = result;
}

declare module 'intern/dojo/node!istanbul/index' {
	import index = require('istanbul/index');
	export = index;
}
