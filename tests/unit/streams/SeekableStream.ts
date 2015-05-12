import * as assert from 'intern/chai!assert';
import * as registerSuite from 'intern!object';
import ArraySource from 'src/streams/ArraySource';
import CountQueuingStrategy from 'src/streams/CountQueuingStrategy';
import Promise from 'src/Promise';
import { State } from 'src/streams/ReadableStream';
import { ReadResult } from 'src/streams/ReadableStreamReader';
import SeekableStream from 'src/streams/SeekableStream';
import SeekableStreamReader from 'src/streams/SeekableStreamReader';

const asyncTimeout = 1000;
let data: string[];
let source: ArraySource<string>;
let stream: SeekableStream<string>;
let reader: SeekableStreamReader<string>;

registerSuite({
	name: 'SeekableStream',

	beforeEach() {
		data = [
			'test1',
			'test2',
			'test3'
		];
		source = new ArraySource<string>(data);
		stream = new SeekableStream<string>(source, new CountQueuingStrategy({ highWaterMark: Infinity }));
		reader = stream.getReader();
	},

	read() {
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
		assert.strictEqual(reader.currentPosition, 0);

		return reader.seek(1).then((seekPosition: number) => {
			assert.strictEqual(seekPosition, 1);
			assert.strictEqual(reader.currentPosition, 1);

			return reader.read();
		}).then((result: ReadResult<string>) => {
			assert.strictEqual(result.value, data[1]);

			return reader.seek(2);
		}).then((seekPosition: number) => {
			assert.strictEqual(seekPosition, 2);
			assert.strictEqual(reader.currentPosition, 2);

			return reader.read();
		}).then((result: ReadResult<string>) => {
			assert.strictEqual(result.value, data[2]);

			return reader.seek(0);
		}).then((seekPosition: number) => {
			assert.strictEqual(seekPosition, 0);
			assert.strictEqual(reader.currentPosition, 0);

			return reader.read();
		}).then((result: ReadResult<string>) => {
			assert.strictEqual(result.value, data[0]);
		});
	},

	preventClose: {
		enabled() {
			return reader.read().then(function (result: ReadResult<string>) {
				assert.notStrictEqual(stream.state, State.Closed);
			});
		},

		disabled() {
			stream = new SeekableStream<string>(source, new CountQueuingStrategy({ highWaterMark: Infinity }), false);
			reader = stream.getReader();

			return reader.read().then(function (result: ReadResult<string>) {
				assert.strictEqual(stream.state, State.Closed);
			});
		}
	}
});
