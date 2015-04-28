import { Source } from '../interfaces';
import ReadableStreamController from '../ReadableStreamController';
import Promise from '../../Promise';

export default class ReadableNodeStreamSource<T> implements Source<T> {
	protected _controller: ReadableStreamController<T>;
	protected _isClosed: boolean;
	protected _onClose: () => void;
	protected _onData: (chunk: T) => void;
	protected _onError: (error: Error) => void;
	protected _nodeStream: NodeJS.ReadableStream;

	constructor(nodeStream: NodeJS.ReadableStream) {
		this._isClosed = false;
		this._nodeStream = nodeStream;
	}

	cancel(reason?: any): Promise<void> {
		this._handleClose();

		return Promise.resolve();
	}

	pull(controller: ReadableStreamController<T>): Promise<void> {
		if (this._isClosed) {
			return Promise.reject(new Error('Stream is closed'));
		}

		this._nodeStream.pause();

		var chunk = this._nodeStream.read();

		if (chunk) {
			controller.enqueue(chunk);
		}

		this._nodeStream.resume();

		return Promise.resolve();
	}

	start(controller: ReadableStreamController<T>): Promise<void> {
		this._onClose = this._handleClose.bind(this);;
		this._onData = controller.enqueue.bind(controller);
		this._onError = this._handleError.bind(this);;

		this._nodeStream.on('close', this._onClose);
		this._nodeStream.on('data', this._onData);
		this._nodeStream.on('end', this._onClose);
		this._nodeStream.on('error', this._onError);

		return Promise.resolve();
	}

	// Perform internal close logic
	protected _close(): void {
		this._isClosed = true;
		this._removeListeners();
	}

	// Handle external request to close
	protected _handleClose(): void {
		this._close();
		this._controller.close();
	}

	protected _handleError(error: Error): void {
		this._close();
		this._controller.error(error);
	}

	protected _removeListeners(): void {
		this._nodeStream.removeListener('close', this._onClose);
		this._nodeStream.removeListener('data', this._onData);
		this._nodeStream.removeListener('end', this._onClose);
		this._nodeStream.removeListener('error', this._onError);
	}
}
