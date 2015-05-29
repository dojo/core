const BASE64_KEYSTR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function normalizeEncodingArgs(data: any, alternateCodec: any): [ string, number[] ] {
	data = String(data);

	let buffer = <number[]> [];

	return [ data, buffer];
}

function validateDecodingArgs(data: any) {
	return data == null ? false : true;
}

function validateUtf8EncodedCodePoint(codePoint: number): void {
	if ((codePoint & 0xC0) !== 0x80) {
		throw Error('Invalid continuation byte');
	}
}

function decodeUtf8EncodedCodePoint(codePoint: number, validationRange: number[] = [0, Infinity], checkSurrogate?: boolean): string {
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

/**
 * Ascii codec that provides facilities for encoding a string (or string coerced object)
 * into an Ascii encoded byte buffer as well as decoding an Ascii encoded byte buffer
 * into a string.
 */
export class Ascii {
	/**
	 * Encode a string or string coerced object into an Ascii byte buffer
	 *
	 * @param data
	 * Any object that is either a string or can be coerced into a string
	 */
	static encode(data: any): number[] {
		let buffer: number[];

		[ data, buffer ] = normalizeEncodingArgs(data, Ascii);

		for (let i = 0, length = data.length; i < length; i++) {
			buffer[i] = data.charCodeAt(i);
		}

		return buffer;
	}

	/**
	 * Decode an Ascii encoded byte buffer into a string
	 *
	 * @param data
	 * The byte buffer to be decoded
	 */
	static decode(data: number[]): string {
		if (!validateDecodingArgs(data)) {
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
 * Utf8 codec that provides facilities for encoding a string (or string coerced object)
 * into an Utf8 encoded byte buffer as well as decoding an Utf8 encoded byte buffer
 * into a string.
 * Inspired by the work of: https://github.com/mathiasbynens/utf8.js
 */
export class Utf8 {
	/**
	 * Encode a string or string coerced object into an Utf8 byte buffer
	 *
	 * @param data
	 * Any object that is either a string or can be coerced into a string
	 */
	static encode(data: any): number[] {
		let buffer: number[];

		[ data, buffer ] = normalizeEncodingArgs(data, Utf8);

		let position = 0;

		for (let i = 0, length = data.length; i < length; i++) {
			let encodedChar = data.charCodeAt(i);

			/**
			 * Surrogates
			 * http://en.wikipedia.org/wiki/Universal_Character_Set_characters
			 */
			if (encodedChar > 0xD800 && encodedChar < 0xDBFF) {
				let lowSurrogate = data.charCodeAt(++i);
				if (lowSurrogate >= 0xDC00 && lowSurrogate < 0xDFFF) {
					encodedChar = 0x010000 + (encodedChar - 0xD800) * 0x0400 + (lowSurrogate - 0xDC00);
				}
				else {
					i--;
				}
			}

			if (encodedChar < 0x80) {
				buffer[position++] = encodedChar;
			}
			else {
				if (encodedChar < 0x800) {
					buffer[position++] = ((encodedChar >> 0x06) & 0x1F) | 0xC0;
				}
				else if (encodedChar < 0x010000) {
					if (encodedChar >= 0xD800 && encodedChar <= 0xDFFF) {
						throw Error('Surrogate is not a scalar value');
					}

					buffer[position++] = ((encodedChar >> 0x0C) & 0x0F) | 0xE0;
					buffer[position++] = ((encodedChar >> 0x06) & 0x3F) | 0x80;
				}
				else if (encodedChar < 0x200000) {
					buffer[position++] = ((encodedChar >> 0x12) & 0x07) | 0xF0;
					buffer[position++] = ((encodedChar >> 0x0C) & 0x3F) | 0x80;
					buffer[position++] = ((encodedChar >> 0x06) & 0x3F) | 0x80;
				}
				buffer[position++] = (encodedChar & 0x3F) | 0x80;
			}
		}

		buffer.length = position;

		return buffer;
	}

	/**
	 * Decode a Utf8 encoded byte buffer into a string
	 *
	 * @param data
	 * The byte buffer to be decoded
	 */
	static decode(data: number[]): string {
		if (!validateDecodingArgs(data)) {
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
 * Hex codec that provides facilities for encoding a string (or string coerced object)
 * into an Hex encoded byte buffer as well as decoding an Hex encoded byte buffer
 * into a string.
 */
export class Hex {
	/**
	 * Encode a string or string coerced object into an Hex byte buffer
	 *
	 * @param data
	 * Any object that is either a string or can be coerced into a string
	 */
	static encode(data: any): number[] {
		let buffer: number[];

		[ data, buffer ] = normalizeEncodingArgs(data, Hex);

		for (let i = 0, length = data.length; i < length; i+=2) {
			let encodedChar = parseInt(data.substr(i, 2), 16);

			buffer.push(encodedChar);
		}

		return buffer;
	}

	/**
	 * Decode a Hex encoded byte buffer into a string
	 *
	 * @param data
	 * The byte buffer to be decoded
	 */
	static decode(data: number[]): string {
		if (!validateDecodingArgs(data)) {
			return '';
		}

		let decoded = '';

		for (let i = 0, length = data.length; i < length; i++) {
			decoded += parseInt('' + data[i], 10).toString(16).toUpperCase();
		}

		return decoded;
	}
}

/**
 * Base64 codec that provides facilities for encoding a string (or string coerced object)
 * into an Base64 encoded byte buffer as well as decoding an Base64 encoded byte buffer
 * into a string.
 */
export class Base64 {
	/**
	 * Encode a string or string coerced object into an Base64 byte buffer
	 *
	 * @param data
	 * Any object that is either a string or can be coerced into a string
	 */
	static encode(data: any): number[] {
		let buffer: number[];

		[ data, buffer ] = normalizeEncodingArgs(data, Base64);

		data = data.replace(/=+$/, '');

		for (let i = 0, length = data.length; i < length;) {
			let encoded = BASE64_KEYSTR.indexOf(data[i]) << 18;
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
	}

	/**
	 * Decode a Base64 encoded byte buffer into a string
	 *
	 * @param data
	 * The byte buffer to be decoded
	 */
	static decode(data: number[]): string {
		if (!validateDecodingArgs(data)) {
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
