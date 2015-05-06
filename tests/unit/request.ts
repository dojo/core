import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import request from 'src/request';
import { default as nodeRequest } from 'src/request/node';
import { default as xhrRequest } from 'src/request/xhr';

registerSuite({
	name: 'request',

	'default provider'() {
		let provider = request.providerRegistry.match();
		assert.isTrue(provider === nodeRequest || provider === xhrRequest);
	}
});
