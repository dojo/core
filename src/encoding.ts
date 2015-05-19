const BASE64_KEYSTR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function normalizeEncodingArgs(data: any, alternateCodec: any): [ string, ByteBuffer ]{
	data = String(data);

	return [ data, <ByteBuffer> {
		toString: function (codec?: any): string {
			return (codec || alternateCodec).decode(this);
		},
		toJSON: function (): string {
			return JSON.stringify(Array.prototype.slice.call(this));
		},
		length: data.length
	}];
}

function validateDecodingArgs(data: any) {
	if (data == null) {
		return false;
	}

	if (data.length == null) {
		throw new TypeError('Argument must have a length property');
	}

	return true;
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

export interface ByteBuffer {
	[index: number]: number;
	toString?: (codec?: any) => string;
	toJSON?: () => string;
	length: number;
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
	static encode(data: any): ByteBuffer {
		let buffer: ByteBuffer;

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
	static decode(data: ByteBuffer): string {
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
 */
export class Utf8 {
	/**
	 * Encode a string or string coerced object into an Utf8 byte buffer
	 *
	 * @param data
	 * Any object that is either a string or can be coerced into a string
	 */
	static encode(data: any): ByteBuffer {
		let buffer: ByteBuffer;

		[ data, buffer ] = normalizeEncodingArgs(data, Utf8);

		let position = 0;

		for (let i = 0, length = data.length; i < length; i++) {
			let encodedChar = data.charCodeAt(i);

			/**
			 * Surrogates
			 * http://en.wikipedia.org/wiki/Universal_Character_Set_characters
			 */
			if (encodedChar > 0xD800 && encodedChar < 0xDBFF) {
				let lowSurrogate = data.charCodeAt(i++);
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
	static decode(data: ByteBuffer): string {
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
	static encode(data: any): ByteBuffer {
		let buffer: ByteBuffer;

		[ data, buffer ] = normalizeEncodingArgs(data, Hex);

		for (let i = 0, length = data.length; i < length; i++) {
			let encodedChar = parseInt(data.charCodeAt(i).toString(16), 16);

			buffer[i] = encodedChar;
		}

		return buffer;
	}

	/**
	 * Decode a Hex encoded byte buffer into a string
	 *
	 * @param data
	 * The byte buffer to be decoded
	 */
	static decode(data: ByteBuffer): string {
		if (!validateDecodingArgs(data)) {
			return '';
		}

		let decoded = '';

		for (let i = 0, length = data.length; i < length; i++) {
			let decodedChar = String.fromCharCode(data[i]);

			decoded += decodedChar;
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
	static encode(data: any): ByteBuffer {
		let buffer: ByteBuffer;

		[ data, buffer ] = normalizeEncodingArgs(data, Base64);

		let position = 0;

		for (let i = 0, length = data.length; i < length; i++) {
			let charCode = data.charCodeAt(i);

			if (charCode < 0x00 || charCode > 0x00FF) {
				throw new Error('String contains characters that are out of range');
			}

			let mod3 = i % 3;

			if (mod3 === 0) {
				buffer[position++] = BASE64_KEYSTR.charCodeAt(charCode >> 0x02);
			}
			else if (mod3 === 1) {
				let lastCode = data.charCodeAt(i - 1);
				buffer[position++] = BASE64_KEYSTR.charCodeAt(((lastCode & 0x03) << 0x04) | (charCode >> 0x04));
			}
			else {
				let lastCode = data.charCodeAt(i - 1);
				buffer[position++] = BASE64_KEYSTR.charCodeAt(((lastCode & 0x0F) << 0x02) | (charCode >> 0x06));
				buffer[position++] = BASE64_KEYSTR.charCodeAt(charCode & 0x3F);
			}
		}

		if ((data.length - 1) % 3 === 0) {
			buffer[position++] = BASE64_KEYSTR.charCodeAt((data.charCodeAt(data.length - 1) & 0x03) << 0x04);
		}
		else {
			buffer[position++] = BASE64_KEYSTR.charCodeAt((data.charCodeAt(data.length - 1) & 0x0F) << 0x02);
		}

		buffer.length = position;

		return buffer;
	}

	/**
	 * Decode a Base64 encoded byte buffer into a string
	 *
	 * @param data
	 * The byte buffer to be decoded
	 */
	static decode(data: ByteBuffer): string {
		if (!validateDecodingArgs(data)) {
			return '';
		}

		let decoded = '';

		for (let i = 0, length = data.length; i < length; i++) {
			let charCode = data[i];

			if (charCode < 0x00 || charCode > 0x00FF) {
				throw new Error('Buffer out of range.');
			}

			let charCodeIndex = BASE64_KEYSTR.indexOf(String.fromCharCode(charCode));
			let previousCharCodeIndex = BASE64_KEYSTR.indexOf(String.fromCharCode(data[i - 1]));
			let mod4 = i % 4;

			if (mod4 === 1) {
				decoded += String.fromCharCode(previousCharCodeIndex << 0x02 | charCodeIndex >> 0x04);
			}
			else if (mod4 === 2) {
				decoded += String.fromCharCode((previousCharCodeIndex & 0x0F) << 0x04 | charCodeIndex >> 0x02);
			}
			else if (mod4 === 3) {
				decoded += String.fromCharCode((previousCharCodeIndex & 0x03) << 0x06 | charCodeIndex);
			}
		}

		return decoded;
	}
}
