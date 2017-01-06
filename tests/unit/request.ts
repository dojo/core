import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import Task from '../../src/async/Task';
import request, { providerRegistry, Response, Headers } from '../../src/request';
import 'intern/dojo/has!host-node?./request_node:./request_browser';

const mockData = '{ "foo": "bar" }';
let handle: any;

function mockProvider(url: string): Task<Response> {
	return Task.resolve(new class extends Response {
		bodyUsed: boolean = false;
		headers: Headers = new Headers();
		ok: boolean = true;
		status: number = 200;
		statusText: string = 'OK';
		url: string = url;

		arrayBuffer(): Task<ArrayBuffer> {
			return Task.resolve(<any> null);
		}

		blob(): Task<Blob> {
			return Task.resolve(<any> null);
		}

		formData(): Task<FormData> {
			return Task.resolve(<any> null);
		}

		text(): Task<string> {
			return Task.resolve(mockData);
		}
	});
}

registerSuite({
	name: 'request',

	afterEach() {
		if (handle) {
			handle.destroy();
			handle = null;
		}
	},

	'custom provider': {
		'String matching'() {
			handle = providerRegistry.register('arbitrary.html', mockProvider);

			return request.get('arbitrary.html')
				.then(function (response) {
					return response.text();
				}).then(data => {
					assert.equal(data, mockData);
				});
		},

		'RegExp matching'() {
			handle = providerRegistry.register(/arbitrary\.html$/, mockProvider);

			return request.get('arbitrary.html')
				.then(function (response) {
					return response.text();
				}).then(text => {
					assert.equal(text, mockData);
				});
		},

		'Default matching'() {
			handle = providerRegistry.register(
				function (url: string): boolean {
					return url === 'arbitrary.html';
				},
				mockProvider
			);

			return request.get('arbitrary.html')
				.then(function (response) {
					return response.text();
				}).then(text => {
					assert.equal(text, mockData);
				});
		}
	},

	'custom filters': {
		beforeEach() {
			handle = providerRegistry.register('arbitrary.html', mockProvider);
		},

		'JSON matching'() {
			return request.get('arbitrary.html').then(function (response: any) {
				return response.json();
			}).then((json: any) => {
				assert.deepEqual(json, { foo: 'bar' }, 'JSON parsing should be automatically provided.');
			});
		}
	}
});
