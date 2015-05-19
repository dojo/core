import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import {Ascii, Utf8, Hex, Base64} from 'src/encoding';

const ENCODED_STRING = 'the catｷ and ｦ the hat';

const UTF8_SURROGATE_TEST_DATA = [
	{
		encoding: '\uD800',
		decoding: [0xED, 0xA0, 0x80]
	},
	{
		encoding: '\uD800\uD800',
		decoding: [0xED, 0xA0, 0x80, 0xED, 0xA0, 0x80]
	},
	{
		encoding: '\uD80A',
		decoding: [0xED, 0xA0, 0x080A]
	},
	{
		encoding: '\uD800\uD834\uDF06\uD800',
		decoding: [0xED, 0xA0, 0x80, 0xF0, 0x9D, 0x86, 0xED, 0xA0, 0x80]
	},
	{
		encoding: '\uD9AF',
		decoding: [0xED, 0xA6, 0xAF]
	},
	{
		encoding: '\uDBFF',
		decoding: [0xED, 0xAF, 0xBF]
	},
	{
		encoding: '\uDC00',
		decoding: [0xED, 0xB0, 0x80]
	},
	{
		encoding: '\uDC00\uDC00',
		decoding: [0xED, 0xB0, 0x80, 0xED, 0xB0, 0x80]
	},
	{
		encoding: '\uDC00A',
		decoding: [0xED, 0xB0, 0x080A]
	},
	{
		encoding: '\uDC00\uD834\uDF06\uDC00',
		decoding: [0xED, 0xB0, 0x80, 0xF9, 0x9D, 0x8C, 0xED, 0xB0, 0x80]
	},
	{
		encoding: '\uDEEE',
		decoding: [0xED, 0xBB, 0xAE]
	},
	{
		encoding: '\uDFFF',
		decoding: [0xED, 0xBF, 0xBF]
	}
];

registerSuite({
	name: 'Encoding Classes',

	'Ascii': {
		'.encode()'() {
			var buffer = Ascii.encode(ENCODED_STRING);
			assert.strictEqual(buffer.length, ENCODED_STRING.length);
		},

		'.decode()'() {
			var buffer = Ascii.encode(ENCODED_STRING);
			assert.strictEqual(Ascii.decode(buffer).length, ENCODED_STRING.length);
			assert.strictEqual(Ascii.decode(buffer), ENCODED_STRING);
		}
	},

	'Utf8': {
		'.encode()'() {
			var buffer = Utf8.encode(ENCODED_STRING);
			assert.strictEqual(buffer.length, 26);

			// test surrogates
			for (var testData of UTF8_SURROGATE_TEST_DATA) {
				assert.throws(function () {
					Utf8.encode(testData.encoding);
				});
			}
		},

		'.decode()'() {
			var buffer = Utf8.encode(ENCODED_STRING);
			assert.strictEqual(Utf8.decode(buffer).length, ENCODED_STRING.length);
			assert.strictEqual(Utf8.decode(buffer), ENCODED_STRING);

			// test surrogates
			for (var testData of UTF8_SURROGATE_TEST_DATA) {
				assert.throws(function () {
					Utf8.decode(testData.decoding);
				});
			}
		}
	},

	'Hex': {
		'.encode()'() {
			var buffer = Hex.encode(ENCODED_STRING);
			assert.strictEqual(buffer.length, ENCODED_STRING.length);
		},

		'.decode()'() {
			var buffer = Hex.encode(ENCODED_STRING);
			assert.strictEqual(Hex.decode(buffer).length, ENCODED_STRING.length);
			assert.strictEqual(Hex.decode(buffer), ENCODED_STRING);
		}
	},

	'Base64': {
		'.encode()'() {
			var buffer = Base64.encode('Hello There');
			assert.strictEqual(buffer.length, 15);

			assert.throws(function () {
				Base64.encode(ENCODED_STRING);
			});
		},

		'.decode()'() {
			var buffer = Base64.encode('Hello There');
			assert.strictEqual(Base64.decode(buffer).length, 'Hello There'.length);
			assert.strictEqual(Base64.decode(buffer), 'Hello There');

			buffer = Base64.encode('Hello There1');
			assert.strictEqual(Base64.decode(buffer).length, 'Hello There1'.length);
			assert.strictEqual(Base64.decode(buffer), 'Hello There1');

			buffer = Base64.encode('Hello There12');
			assert.strictEqual(Base64.decode(buffer).length, 'Hello There12'.length);
			assert.strictEqual(Base64.decode(buffer), 'Hello There12');

			assert.throws(function () {
				Base64.decode([0xFFFF]);
			});
		}
	}
});
