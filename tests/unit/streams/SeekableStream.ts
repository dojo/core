import * as assert from 'intern/chai!assert';
import * as registerSuite from 'intern!object';
import ArraySource from './helpers/ArraySource';
import CountQueuingStrategy from 'src/streams/CountQueuingStrategy';
import Promise from 'src/Promise';
import { ReadResult } from 'src/streams/ReadableStreamReader';
import SeekableStream from 'src/streams/SeekableStream';

registerSuite({
	name: 'SeekableStream',

	seek() {
		let data = [
			'test1',
			'test2',
			'test3'
		];
		let source = new ArraySource<string>(data);
		let stream = new SeekableStream(source, new CountQueuingStrategy({ highWaterMark: 1}));
		let reader = stream.getReader();

		return Promise.all([
			stream.seek(1).then(() => {
				return reader.read().then((result: ReadResult<string>) => {
					console.log(result.value);
					assert.strictEqual(result.value, data[1]);
				});
			}),
			stream.seek(2).then(() => {
				return reader.read().then((result: ReadResult<string>) => {
					console.log(result.value);
					assert.strictEqual(result.value, data[2]);
				});
			}),
			stream.seek(0).then(() => {
				return reader.read().then((result: ReadResult<string>) => {
					console.log(result.value);
					assert.strictEqual(result.value, data[0]);
				});
			})
		]);
	}
});
