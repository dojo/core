import Promise from '../Promise';
import ReadableStream, { Source } from './ReadableStream';
import ReadableStreamReader from './ReadableStreamReader';
import ReadableStreamController from './ReadableStreamController';

export default class SeekableStream<T> extends ReadableStream<T> {
	_currentPosition: number;

	get currentPosition(): Promise<number> {
		return Promise.resolve(this._currentPosition);
	}

	seek(position: number): Promise<void> {
		if (this._underlyingSource.restartable) {
			return this._underlyingSource.start(this._controller, position).then(() => {
				this._currentPosition = position;
			});
		}
		else {
			return Promise.resolve();
		}
	}

	_pull(): void {
		super._pull();

		if (this._pullingPromise) {
			this._pullingPromise.then(() => {
				this._currentPosition += 1;
			});
		}
	}
}
