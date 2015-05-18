import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';

import ReadableStream from 'src/streams/ReadableStream';
import ReadableStreamReader, { ReadResult } from 'src/streams/ReadableStreamReader';
import EventedStreamSource from 'src/streams/adapters/EventedStreamSource';

import Evented = require('dojo/Evented');

let emitter: Evented;
let stream: ReadableStream<Event>;
let source: EventedStreamSource;
let reader: ReadableStreamReader<Event>;

registerSuite({
	name: 'EventedStreamSource',

	beforeEach() {
		emitter = new Evented();
		source = new EventedStreamSource(emitter, 'testEvent');
		stream = new ReadableStream<Event>(source);
		reader = stream.getReader();

		return stream.started;
	},

	start() {
		let testEvent = {
			test: 'value'
		};

		emitter.emit('testEvent', testEvent);

		return reader.read().then(function (result: ReadResult<Event>) {
			assert.strictEqual(result.value, testEvent,
				'Event read from stream should be the same as the event emitted by emitter');
		});
	},

	'event array'() {
		let testEvent = {
			test: 'value'
		};

		source = new EventedStreamSource(emitter, [ 'apple', 'orange' ]);
		stream = new ReadableStream<Event>(source);
		reader = stream.getReader();

		emitter.emit('apple', testEvent);
		emitter.emit('orange', testEvent);

		return reader.read().then(function (result: ReadResult<Event>) {
			assert.strictEqual(result.value, testEvent);

			return reader.read().then(function (result: ReadResult<Event>) {
				assert.strictEqual(result.value, testEvent);
			});
		});
	},

	cancel() {
		let enqueueCallCount = 0;

		stream.controller.enqueue = function (chunk: Event) {
			enqueueCallCount += 1;
		};

		source.cancel();
		emitter.emit('testEvent', {});
		assert.strictEqual(enqueueCallCount, 0, 'Canceled source should not call controller.enqueue');
	}
});
