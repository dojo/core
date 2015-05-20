import registerSuite = require('intern!object');
import assert = require('intern/chai!assert');
import {Ascii, Utf8, Hex, Base64} from 'src/encoding';

const ENCODED_STRING = 'the catｷ and ｦ the hat';
const ASCII_BUFFER = [116, 104, 101, 32, 99, 97, 116, 65399, 32, 97, 110, 100, 32, 65382, 32, 116, 104, 101, 32, 104, 97, 116];
const UTF8_BUFFER = [116, 104, 101, 32, 99, 97, 116, 239, 189, 183, 32, 97, 110, 100, 32, 239, 189, 166, 32, 116, 104, 101, 32, 104, 97, 116];
const HEX_BUFFER = [116, 104, 101, 32, 99, 97, 116, 65399, 32, 97, 110, 100, 32, 65382, 32, 116, 104, 101, 32, 104, 97, 116];
const BASE64_BUFFER = [83, 71, 86, 115, 98, 71, 56, 103, 86, 71, 104, 108, 99, 109, 85];

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
			let buffer = Ascii.encode(ENCODED_STRING);
			assert.strictEqual(buffer.length, ENCODED_STRING.length);

			for (let i = 0, length = buffer.length; i < length; i++) {
				assert.strictEqual(buffer[i], ASCII_BUFFER[i]);
			}

			assert.strictEqual(buffer.toJSON(), '[' + ASCII_BUFFER + ']');
			assert.strictEqual(buffer.toString(), ENCODED_STRING);

			buffer = Ascii.encode(1);
			assert.strictEqual(buffer.length, 1);
			assert.strictEqual(buffer[0], 49);
		},

		'.decode()'() {
			let decoded = Ascii.decode(ASCII_BUFFER);
			assert.strictEqual(decoded.length, ENCODED_STRING.length);
			assert.strictEqual(decoded, ENCODED_STRING);

			assert.strictEqual(Ascii.decode(undefined), '');
		}
	},

	'Utf8': {
		'.encode()'() {
			let buffer = Utf8.encode(ENCODED_STRING);
			assert.strictEqual(buffer.length, 26);

			for (let i = 0, length = buffer.length; i < length; i++) {
				assert.strictEqual(buffer[i], UTF8_BUFFER[i]);
			}

			// test surrogates
			for (var testData of UTF8_SURROGATE_TEST_DATA) {
				assert.throws(function () {
					Utf8.encode(testData.encoding);
				});
			}

			assert.strictEqual(buffer.toJSON(), '[' + UTF8_BUFFER + ']');
			assert.strictEqual(buffer.toString(), ENCODED_STRING);

			buffer = Utf8.encode(1);
			assert.strictEqual(buffer.length, 1);
			assert.strictEqual(buffer[0], 49);

			assert.throws(function () {
				Utf8.encode('𐌆');
			});

			buffer = Utf8.encode('\u0000');
			let bufferArray = [0];
			for (let i = 0, length = buffer.length; i < length; i++) {
				assert.strictEqual(buffer[i], bufferArray[i]);
			};

			buffer = Utf8.encode('\\');
			bufferArray = [0x5C];
			for (let i = 0, length = buffer.length; i < length; i++) {
				assert.strictEqual(buffer[i], bufferArray[i]);
			};

			buffer = Utf8.encode('');
			bufferArray = [0xC2, 0x80];
			for (let i = 0, length = buffer.length; i < length; i++) {
				assert.strictEqual(buffer[i], bufferArray[i]);
			};

			buffer = Utf8.encode('ⰼ');
			bufferArray = [0xE2, 0xB0, 0xBC];
			for (let i = 0, length = buffer.length; i < length; i++) {
				assert.strictEqual(buffer[i], bufferArray[i]);
			};

			buffer = Utf8.encode('𐐁');
			bufferArray = [0xF0, 0x90, 0x90, 0x81];
			for (let i = 0, length = buffer.length; i < length; i++) {
				assert.strictEqual(buffer[i], bufferArray[i]);
			};
		},

		'.decode()'() {
			let decoded = Utf8.decode(UTF8_BUFFER);
			assert.strictEqual(decoded.length, ENCODED_STRING.length);
			assert.strictEqual(decoded, ENCODED_STRING);

			// test surrogates
			for (var testData of UTF8_SURROGATE_TEST_DATA) {
				assert.throws(function () {
					Utf8.decode(testData.decoding);
				});
			}

			assert.strictEqual(Utf8.decode([0]), '\u0000');
			assert.strictEqual(Utf8.decode([0x5C]), '\\');
			assert.strictEqual(Utf8.decode([0xC2, 0x80]), '');
			assert.strictEqual(Utf8.decode([0xE2, 0xB0, 0xBC]), 'ⰼ');
			assert.strictEqual(Utf8.decode([0xF0, 0x9D, 0x8C, 0x86]), '𐌆');

			assert.strictEqual(Utf8.decode(undefined), '');

			assert.throws(function () {
				Utf8.decode([0xFFFFFF]);
			});

			assert.throws(function () {
				Utf8.decode([0xFFFFFFFF]);
			});

			assert.throws(function () {
				Utf8.decode([0x1FFFF]);
			});
		}
	},

	'Hex': {
		'.encode()'() {
			let buffer = Hex.encode(ENCODED_STRING);
			assert.strictEqual(buffer.length, ENCODED_STRING.length);

			for (let i = 0, length = buffer.length; i < length; i++) {
				assert.strictEqual(buffer[i], HEX_BUFFER[i]);
			}

			assert.strictEqual(buffer.toJSON(), '[' + HEX_BUFFER + ']');
			assert.strictEqual(buffer.toString(), ENCODED_STRING);

			buffer = Hex.encode(1);
			assert.strictEqual(buffer.length, 1);
			assert.strictEqual(buffer[0], 49);
		},

		'.decode()'() {
			let decoded = Hex.decode(HEX_BUFFER);
			assert.strictEqual(decoded.length, ENCODED_STRING.length);
			assert.strictEqual(decoded, ENCODED_STRING);

			assert.strictEqual(Hex.decode(undefined), '');
		}
	},

	'Base64': {
		'.encode()'() {
			let buffer = Base64.encode('Hello There');
			assert.strictEqual(buffer.length, BASE64_BUFFER.length);

			for (let i = 0, length = buffer.length; i < length; i++) {
				assert.strictEqual(buffer[i], BASE64_BUFFER[i]);
			}

			assert.throws(function () {
				Base64.encode(ENCODED_STRING);
			});

			assert.strictEqual(buffer.toJSON(), '[' + BASE64_BUFFER + ']');
			assert.strictEqual(buffer.toString(), 'Hello There');

			buffer = Base64.encode(1);
			assert.strictEqual(buffer.length, 2);
			assert.strictEqual(buffer[0], 77);
			assert.strictEqual(buffer[1], 81);
		},

		'.decode()'() {
			let decoded = Base64.decode(BASE64_BUFFER);
			assert.strictEqual(decoded.length, 'Hello There'.length);
			assert.strictEqual(decoded, 'Hello There');

			decoded = Base64.decode(BASE64_BUFFER.concat([120, 69]));
			assert.strictEqual(decoded.length, 'Hello There1'.length);
			assert.strictEqual(decoded, 'Hello There1');

			decoded = Base64.decode(BASE64_BUFFER.concat([120, 77, 103]));
			assert.strictEqual(decoded.length, 'Hello There12'.length);
			assert.strictEqual(decoded, 'Hello There12');

			assert.throws(function () {
				Base64.decode([0xFFFF]);
			});

			assert.strictEqual(Base64.decode(undefined), '');
		}
	}
});
