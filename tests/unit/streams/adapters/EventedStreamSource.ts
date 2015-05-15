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
		reader = stream.getReader();;
	},

	start() {
		emitter.emit('testEvent');
		reader.read().then(function (result: ReadResult<Event>) {
			console.dir(event);
		});
	}
});
