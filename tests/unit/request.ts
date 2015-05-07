import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import request, { Response } from 'src/request';
import { default as nodeRequest } from 'src/request/node';
import { default as xhrRequest } from 'src/request/xhr';
import has = require('intern/dojo/has');
import Deferred = require('intern/dojo/Deferred');
import * as url from 'url';
import * as http from 'http';

let suite: { [name: string]: any } = {
	name: 'request',

	'default provider'() {
		let provider = request.providerRegistry.match();
		assert.isTrue(provider === nodeRequest || provider === xhrRequest);
	},
};

if (has('host-node')) {
	let server: any;
	let serverPort = 8124;
	let serverUrl = 'http://localhost:' + serverPort;

	function getRequestUrl(dataKey: string): string {
		return serverUrl + '?dataKey=' + dataKey;
	}

	suite['node'] = {
		setup() {
			var dfd = new Deferred();
			var responseData: { [name: string]: any } = {
				fooBar: JSON.stringify({foo: "bar"}),
				invalidJson: '<not>JSON</not>'
			};

			function getResponseData(request: any) {
				var parseQueryString = true;
				var urlInfo = url.parse(request.url, parseQueryString);
				return responseData[urlInfo.query.dataKey];
			}

			server = http.createServer(function(request, response){
				var body = getResponseData(request);

				response.writeHead(200, {
					'Content-Length': body.length,
					'Content-Type': 'application/json'
				});
				response.write(body);
				response.end();
			});

			server.on('listening', dfd.resolve);
			server.listen(serverPort);

			return dfd.promise;
		},

		teardown() {
			server.close();
		},

		'.get'() {
			var dfd = this.async();
			request.get(getRequestUrl('fooBar'))
				.then(
					dfd.callback((response: any) => assert.equal(String(response.data), JSON.stringify({foo: 'bar'}))),
					dfd.reject.bind(dfd)
				);
		},

		'JSON filter'() {
			request.filterRegistry.register(/fooBar$/, (response: Response<any>) => {
				response.data = JSON.parse(String(response.data));
				return response;
			});

			var dfd = this.async();
			request.get(getRequestUrl('fooBar'))
				.then(
					dfd.callback((response: any) => assert.deepEqual(response.data, {foo: 'bar'})),
					dfd.reject.bind(dfd)
				);
		}
	}
}

if (has('host-browser')) {
}

registerSuite(suite);
