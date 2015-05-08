import Promise from '../Promise';
import ReadableStream, { Source } from './ReadableStream';
//import ReadableStreamReader from './ReadableStreamReader';
//import ReadableStreamController from './ReadableStreamController';
import SeekableStreamReader from './SeekableStreamReader';
import { Strategy } from './interfaces';

export default class SeekableStream<T> extends ReadableStream<T> {
	//protected _currentPosition: number;
	//protected _currentPositionPromise: Promise<number>;
	//_reader: SeekableStreamReader<T>;

	/*constructor(underlyingSource: Source<T>, strategy: Strategy<T>) {
		super(underlyingSource, strategy);
		this._currentPosition = 0;
	}*/

	/*get currentPosition(): Promise<number> {
		return this._currentPositionPromise || Promise.resolve(this._currentPosition);
	}*/

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
			// TODO: move forward to position?
			return Promise.resolve(5);
		}
	}

/*	_pull(): void {
		super._pull();
		if (this._pullingPromise) {
			this._currentPositionPromise = this._pullingPromise.then(() => {
				this._currentPosition +=
				})
		}
	}*/
}
