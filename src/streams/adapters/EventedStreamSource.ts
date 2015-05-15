import Evented = require('dojo/Evented');
import on = require('dojo/on');

import Promise from '../../Promise';
import { Source } from '../ReadableStream';
import ReadableStreamController from '../ReadableStreamController';

export default class EventedStreamSource<Event> implements Source<Event> {
	protected _controller: ReadableStreamController<Event>;
	protected _target: Evented | HTMLElement;
	protected _events: string[];
	// TODO: use Handle
	protected _handles: any[];
	protected _pullPromise: Promise<void>;
	protected _queue: Event[];
	protected _rejectPullPromise: (error: Error) => void;
	protected _resolvePullPromise: () => void;

	constructor(target: Evented | HTMLElement, type: string | string[]) {
		this._target = target;

		// TODO: remove casts when tsc is fixed
		if (typeof type === 'string') {
			this._events = [ <string> type ];
		}
		else {
			this._events = <string[]> type;
		}

		this._handles = [];
		this._queue = [];
	}

	start(controller: ReadableStreamController<Event>): Promise<void> {
		this._controller = controller;
		this._events.forEach(function (eventName: string) {
			this._handles.push(on(this._target, eventName, this._handleEvent.bind(this)));
		});

		return Promise.resolve();
	}

	pull(controller: ReadableStreamController<Event>): Promise<void> {
		if (this._pullPromise) {
			// TODO: is this correct behavior?
			return this._pullPromise;
		}

		if (this._queue.length) {
			controller.enqueue(this._queue.shift());

			return Promise.resolve();
		}
		else {
			this._pullPromise = new Promise<void>((resolve, reject) => {
				this._resolvePullPromise = resolve;
				this._rejectPullPromise = reject;
			});

			return this._pullPromise;
		}
	}

	cancel(reason?: any): Promise<void> {
		while (this._handles.length) {
			this._handles.shift().remove();
		}

		if (this._pullPromise) {
			// TODO: is this correct logic for cancellation?
			this._rejectPullPromise(new Error('Source has been canceled'));
		}

		return Promise.resolve();
	}

	protected _handleEvent(event: Event) {
		if (this._pullPromise) {
			this._controller.enqueue(event);
			this._resolvePullPromise();
		}
		else {
			this._queue.push(event);
		}
	}
}
