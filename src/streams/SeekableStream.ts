import { Strategy } from './interfaces';
import Promise from '../Promise';
import ReadableStream, { Source } from './ReadableStream';
import SeekableStreamReader from './SeekableStreamReader';

export default class SeekableStream<T> extends ReadableStream<T> {
	preventClose: boolean;
	_reader: SeekableStreamReader<T>;

	constructor(underlyingSource: Source<T>, strategy: Strategy<T> = {}, preventClose: boolean = true) {
		super(underlyingSource, strategy);

		this.preventClose = preventClose;
	}

	getReader(): SeekableStreamReader<T> {
		if (!this.readable || !this.seek) {
			throw new TypeError('Must be a SeekableStream instance');
		}

		return new SeekableStreamReader(this);
	}

	_requestClose(): void {
		if (!this.preventClose) {
			super.requestClose();
		}
	}

	seek(position: number): Promise<number> {
		if (this._underlyingSource.seek) {
			return this._underlyingSource.seek(this.controller, position);
		}
		else {
			if (this._reader && position < this._reader.currentPosition) {
				return Promise.reject(new Error('Stream source is not seekable; cannot seek backwards'));
			}
		}

		return Promise.reject(new Error('Stream is not in a seekable state'));
	}

	get strategy() {
		return this._strategy;
	}
}
