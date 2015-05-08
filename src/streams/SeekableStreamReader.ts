import Promise from '../Promise';
import ReadableStreamReader, { ReadResult } from './ReadableStreamReader';
import SeekableStream from './SeekableStream';

export default class SeekableStreamReader<T> extends ReadableStreamReader<T> {
	protected _currentPosition: number = 0;
	protected _ownerReadableStream: SeekableStream<T>;

	get currentPosition(): Promise<number> {
		return Promise.resolve(this._currentPosition);
	}

	read(): Promise<ReadResult<T>> {
		return super.read().then((result: ReadResult<T>) => {
			var chunkSize = 1;

			try {
				if (this._ownerReadableStream._strategy.size) {
					chunkSize = this._ownerReadableStream._strategy.size(result.value);
				}
			}
			catch (error) {
				this._ownerReadableStream.error(error);

				return Promise.reject(error);
			}

			this._currentPosition += chunkSize;

			return Promise.resolve(result);
		});
	}

	seek(position: number): Promise<number> {
		return this._ownerReadableStream.seek(position).then((position: number) => {
			this._currentPosition = position;

			return Promise.resolve(position);
		}, (error: Error) => {
			return Promise.reject(error);
		});
	}
}
