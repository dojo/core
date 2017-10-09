const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
import Suite from 'intern/lib/Suite';
import { Require } from '@dojo/interfaces/loader';
import pollUntil from '@theintern/leadfoot/helpers/pollUntil';

declare const require: Require;

async function executeTest(suite: Suite, htmlTestPath: string, timeout = 10000) {
	await suite.remote.get(htmlTestPath);
	try {
		return await (pollUntil(function () {
			return (<any> window).loaderTestResults;
		}, undefined, timeout) as any);
	}
	catch (e) {
		throw new Error('loaderTestResult was not set.');
	}
}

const text = 'abc';

registerSuite('text plugin', {
	async 'correct text'(this: any) {
		const results = await executeTest(this, './textPlugin.html');
		assert.strictEqual(results.text, text);
	},

	async 'strips XML'(this: any) {
		const results = await executeTest(this, './textPluginXML.html');
		assert.strictEqual(results.text, text);
	},

	async 'strips HTML'(this: any) {
		const results = await executeTest(this, './textPluginHTML.html');
		assert.strictEqual(results.text, text);
	},

	async 'strips empty file'(this: any) {
		const results = await executeTest(this, './textPluginEmpty.html');
		assert.strictEqual(results.text, text);
	}
});
