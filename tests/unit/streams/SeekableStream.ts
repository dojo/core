import * as assert from 'intern/chai!assert';
import * as registerSuite from 'intern!object';
import ArraySource from 'src/streams/ArraySource';
import CountQueuingStrategy from 'src/streams/CountQueuingStrategy';
import Promise from 'src/Promise';
import { ReadResult } from 'src/streams/ReadableStreamReader';
import SeekableStream from 'src/streams/SeekableStream';

let asyncTimeout = 1000;

registerSuite({
	name: 'SeekableStream',

	read() {
		let data = [
			'test1',
			'test2',
			'test3'
		];
		let source = new ArraySource<string>(data);
		let stream = new SeekableStream<string>(source, new CountQueuingStrategy({ highWaterMark: 1 }));
		let reader = stream.getReader();

		assert.strictEqual(reader.currentPosition, 0);

		return reader.read().then((result: ReadResult<string>) => {
			assert.strictEqual(result.value, data[0]);
			assert.strictEqual(reader.currentPosition, 1);

			return reader.read();
		}).then((result: ReadResult<string>) => {
			assert.strictEqual(result.value, data[1]);
		});
	},

	seek() {
		let data = [
			'test1',
			'test2',
			'test3'
		];
		let source = new ArraySource<string>(data);
		let stream = new SeekableStream<string>(source, new CountQueuingStrategy({ highWaterMark: 1}));
		let reader = stream.getReader();

		assert.strictEqual(reader.currentPosition, 0);

		return reader.seek(1).then((seekPosition: number) => {
			assert.strictEqual(seekPosition, 1);
			assert.strictEqual(reader.currentPosition, 1);

			return reader.read();
		}).then((result: ReadResult<string>) => {
			console.log(result.value);
			assert.strictEqual(result.value, data[1]);

			return reader.seek(2);
		}).then((seekPosition: number) => {
			assert.strictEqual(seekPosition, 2);
			assert.strictEqual(reader.currentPosition, 2);

			return reader.read();
		}).then((result: ReadResult<string>) => {
			console.log(result.value);
			assert.strictEqual(result.value, data[2]);

			return reader.seek(0);
		}).then((seekPosition: number) => {
			assert.strictEqual(seekPosition, 0);
			assert.strictEqual(reader.currentPosition, 0);

			return reader.read();
		}).then((result: ReadResult<string>) => {
			console.log(result.value);
			assert.strictEqual(result.value, data[0]);
		});
	}
});
