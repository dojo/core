import Promise from '../Promise';
import ReadableStream, { Source } from './ReadableStream';
import SeekableStreamReader from './SeekableStreamReader';

export default class SeekableStream<T> extends ReadableStream<T> {
	_reader: SeekableStreamReader<T>;

	getReader(): SeekableStreamReader<T> {
		if (!this.readable || !this.seek) {
			throw new TypeError('Must be a SeekableStream instance');
		}

		return new SeekableStreamReader(this);
	}

	seek(position: number): Promise<number> {
		if (this._underlyingSource.seek) {
			return this._underlyingSource.seek(this._controller, position);
		}
		else {
			if (this._reader) {
				if (position < this._reader.currentPosition) {
					return Promise.reject(new Error('Stream source is not seekable; cannot seek backwards'));
				}
			}
		}

		// TODO: figure out if anything needs to be done here
		// (I think all logic is already covered in SeekableStreamReader.seek)
		console.warn('SeekableStream#seek: why are you here?');

		return Promise.resolve(position);
	}
}
