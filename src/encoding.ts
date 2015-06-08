import { HIGH_SURROGATE_MIN, HIGH_SURROGATE_MAX, LOW_SURROGATE_MIN, LOW_SURROGATE_MAX } from './string';

type ByteBuffer = Uint8Array | Buffer | number[];
const BASE64_KEYSTR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function validateUtf8EncodedCodePoint(codePoint: number): void {
	if ((codePoint & 0xC0) !== 0x80) {
		throw Error('Invalid continuation byte');
	}
}

function decodeUtf8EncodedCodePoint(codePoint: number, validationRange: number[] = [ 0, Infinity ], checkSurrogate?: boolean): string {
	if (codePoint < validationRange[0] || codePoint > validationRange[1]) {
		throw Error('Invalid continuation byte');
	}

	if (checkSurrogate && codePoint >= 0xD800 && codePoint <= 0xDFFF) {
		throw Error('Surrogate is not a scalar value');
	}

	let encoded = '';

	if (codePoint > 0xFFFF) {
		codePoint = codePoint - 0x010000;
		encoded += String.fromCharCode(codePoint >>> 0x10 & 0x03FF | 0xD800);
		codePoint = 0xDC00 | codePoint & 0x03FF;
	}

	encoded += String.fromCharCode(codePoint);

	return encoded;
}

export interface Codec {
	encode(data: string): number[];
	decode(data: ByteBuffer): string;
}

/**
 * Ascii codec that provides facilities for encoding a string
 * into an Ascii encoded byte buffer as well as decoding an Ascii encoded byte buffer
 * into a string.
 */
export const ascii: Codec = {
	/**
	 * Encode a string into an Ascii byte buffer
	 *
	 * @param data
	 * A text string to be encoded
	 */
	encode(data: string): number[] {
		if (data == null) {
			return [];
		}

		const buffer: number[] = [];

		for (let i = 0, length = data.length; i < length; i++) {
			buffer[i] = data.charCodeAt(i);
		}

		return buffer;
	},

	/**
	 * Decode an Ascii encoded byte buffer into a string
	 *
	 * @param data
	 * The byte buffer to be decoded
	 */
	decode(data: ByteBuffer): string {
		if (data == null) {
			return '';
		}

		let decoded = '';

		for (let i = 0, length = data.length; i < length; i++) {
			decoded += String.fromCharCode(data[i]);
		}

		return decoded;
	}
}

/**
 * Utf8 codec that provides facilities for encoding a string
 * into an Utf8 encoded byte buffer as well as decoding an Utf8 encoded byte buffer
 * into a string.
 * Inspired by the work of: https://github.com/mathiasbynens/utf8.js
 */
export const utf8: Codec = {
	/**
	 * Encode a string into an Utf8 byte buffer
	 *
	 * @param data
	 * A text string to be encoded
	 */
	encode(data: string): number[] {
		if (data == null) {
			return [];
		}

		const buffer: number[] = [];

		for (let i = 0, length = data.length; i < length; i++) {
			let encodedChar = data.charCodeAt(i);

			/**
			 * Surrogates
			 * http://en.wikipedia.org/wiki/Universal_Character_Set_characters
			 */
			if (encodedChar >= HIGH_SURROGATE_MIN && encodedChar <= HIGH_SURROGATE_MAX) {
				let lowSurrogate = data.charCodeAt(i + 1);
				if (lowSurrogate >= LOW_SURROGATE_MIN && lowSurrogate <= LOW_SURROGATE_MAX) {
					encodedChar = 0x010000 + (encodedChar - 0xD800) * 0x0400 + (lowSurrogate - 0xDC00);
					i++;
				}
			}

			if (encodedChar < 0x80) {
				buffer.push(encodedChar);
			}
			else {
				if (encodedChar < 0x800) {
					buffer.push(((encodedChar >> 0x06) & 0x1F) | 0xC0);
				}
				else if (encodedChar < 0x010000) {
					if (encodedChar >= 0xD800 && encodedChar <= 0xDFFF) {
						throw Error('Surrogate is not a scalar value');
					}

					buffer.push(((encodedChar >> 0x0C) & 0x0F) | 0xE0);
					buffer.push(((encodedChar >> 0x06) & 0x3F) | 0x80);
				}
				else if (encodedChar < 0x200000) {
					buffer.push(((encodedChar >> 0x12) & 0x07) | 0xF0);
					buffer.push(((encodedChar >> 0x0C) & 0x3F) | 0x80);
					buffer.push(((encodedChar >> 0x06) & 0x3F) | 0x80);
				}
				buffer.push((encodedChar & 0x3F) | 0x80);
			}
		}

		return buffer;
	},

	/**
	 * Decode a Utf8 encoded byte buffer into a string
	 *
	 * @param data
	 * The byte buffer to be decoded
	 */
	decode(data: ByteBuffer): string {
		if (data == null) {
			return '';
		}

		let decoded = '';

		for (let i = 0, length = data.length; i < length; i++) {
			let byte1 = data[i] & 0xFF;

			if ((byte1 & 0x80) === 0) {
				decoded += decodeUtf8EncodedCodePoint(byte1);
			}
			else if ((byte1 & 0xE0) === 0xC0) {
				let byte2 = data[++i] & 0xFF;
				validateUtf8EncodedCodePoint(byte2);
				byte2 = byte2 & 0x3F;
				let encodedByte = ((byte1 & 0x1F) << 0x06) | byte2;
				decoded += decodeUtf8EncodedCodePoint(encodedByte, [0x80, Infinity]);
			}
			else if ((byte1 & 0xF0) === 0xE0) {
				let byte2 = data[++i] & 0xFF;
				validateUtf8EncodedCodePoint(byte2);
				byte2 = byte2 & 0x3F;

				let byte3 = data[++i] & 0xFF;
				validateUtf8EncodedCodePoint(byte3);
				byte3 = byte3 & 0x3F;

				let encodedByte = ((byte1 & 0x1F) << 0x0C) | (byte2 << 0x06) | byte3;
				decoded += decodeUtf8EncodedCodePoint(encodedByte, [0x0800, Infinity], true);
			}
			else if ((byte1 & 0xF8) === 0xF0) {
				let byte2 = data[++i] & 0xFF;
				validateUtf8EncodedCodePoint(byte2);
				byte2 = byte2 & 0x3F;

				let byte3 = data[++i] & 0xFF;
				validateUtf8EncodedCodePoint(byte3);
				byte3 = byte3 & 0x3F;

				let byte4 = data[++i] & 0xFF;
				validateUtf8EncodedCodePoint(byte4);
				byte4 = byte4 & 0x3F;

				let encodedByte = ((byte1 & 0x1F) << 0x0C) | (byte2 << 0x0C) | (byte3 << 0x06) | byte4;
				decoded += decodeUtf8EncodedCodePoint(encodedByte, [0x010000, 0x10FFFF]);
			}
			else {
				validateUtf8EncodedCodePoint(byte1);
			}
		}

		return decoded;
	}
}

/**
 * Hex codec that provides facilities for encoding a string
 * into an Hex encoded byte buffer as well as decoding an Hex encoded byte buffer
 * into a string.
 */
export const hex: Codec = {
	/**
	 * Encode a string into an Hex byte buffer
	 *
	 * @param data
	 * A Hex encoded string
	 */
	encode(data: string): number[] {
		if (data == null) {
			return [];
		}

		const buffer: number[] = [];

		for (let i = 0, length = data.length; i < length; i += 2) {
			let encodedChar = parseInt(data.substr(i, 2), 16);

			buffer.push(encodedChar);
		}

		return buffer;
	},

	/**
	 * Decode a Hex encoded byte buffer into a string
	 *
	 * @param data
	 * The byte buffer to be decoded
	 */
	decode(data: ByteBuffer): string {
		if (data == null) {
			return '';
		}

		let decoded = '';

		for (let i = 0, length = data.length; i < length; i++) {
			decoded += data[i].toString(16).toUpperCase();
		}

		return decoded;
	}
}

/**
 * Base64 codec that provides facilities for encoding a string
 * into an Base64 encoded byte buffer as well as decoding an Base64 encoded byte buffer
 * into a string.
 */
export const base64: Codec = {
	/**
	 * Encode a string into an Base64 byte buffer
	 *
	 * @param data
	 * A Base64 encoded String
	 */
	encode(data: string): number[] {
		if (data == null) {
			return [];
		}

		const buffer: number[] = [];

		let length = data.length;
		while (data[--length] === '=') { }

		for (let i = 0; i < length;) {
			let encoded = BASE64_KEYSTR.indexOf(data[i++]) << 18;
			if (i <= length) {
				encoded |= BASE64_KEYSTR.indexOf(data[i++]) << 12;
			}
			if (i <= length) {
				encoded |= BASE64_KEYSTR.indexOf(data[i++]) << 6;
			}
			if (i <= length) {
				encoded |= BASE64_KEYSTR.indexOf(data[i++]);
			}

			buffer.push((encoded >>> 16) & 0xff);
			buffer.push((encoded >>> 8) & 0xff);
			buffer.push(encoded & 0xff);
		}

		while (buffer[buffer.length - 1] === 0) {
			buffer.pop();
		}

		return buffer;
	},

	/**
	 * Decode a Base64 encoded byte buffer into a string
	 *
	 * @param data
	 * The byte buffer to be decoded
	 */
	decode(data: ByteBuffer): string {
		if (data == null) {
			return '';
		}

		let decoded = '';
		let i = 0;

		for (let length = data.length - (data.length % 3); i < length;) {
			let encoded = data[i++] << 16 | data[i++] << 8 | data[i++];

			decoded += BASE64_KEYSTR.charAt((encoded >>> 18) & 0x3F);
			decoded += BASE64_KEYSTR.charAt((encoded >>> 12) & 0x3F);
			decoded += BASE64_KEYSTR.charAt((encoded >>> 6) & 0x3F);
			decoded += BASE64_KEYSTR.charAt(encoded & 0x3F);
		}

		if (data.length % 3 === 1) {
			let encoded = data[i++] << 16;
			decoded += BASE64_KEYSTR.charAt((encoded >>> 18) & 0x3f);
			decoded += BASE64_KEYSTR.charAt((encoded >>> 12) & 0x3f);
			decoded += '==';
		}
		else if (data.length % 3 === 2) {
			let encoded = data[i++] << 16 | data[i++] << 8;
			decoded += BASE64_KEYSTR.charAt((encoded >>> 18) & 0x3f);
			decoded += BASE64_KEYSTR.charAt((encoded >>> 12) & 0x3f);
			decoded += BASE64_KEYSTR.charAt((encoded >>> 6) & 0x3f);
			decoded += '=';
		}

		return decoded;
	}
}
