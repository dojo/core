import Promise from 'src/Promise';
import { Source } from 'src/streams/ReadableStream';
import ReadableStreamController from 'src/streams/ReadableStreamController';

export default class ArraySource<T> implements Source<T> {
	_data: Array<T>;
	_position: number;

	restartable: boolean;

	constructor(data: Array<T>) {
		this.restartable = true;
		this._data = data;
	}

	start(controller: ReadableStreamController<T>, position?: number): Promise<void> {
		this._position = position || 0;

		return Promise.resolve();
	}

	pull(controller: ReadableStreamController<T>): Promise<void> {
		controller.enqueue(this._data[this._position]);

		return Promise.resolve();
	}

	cancel(reason?: any): Promise<void> {
		return Promise.resolve();
	}
}
