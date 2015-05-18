import Evented = require('dojo/Evented');
import on = require('dojo/on');

import Promise from '../../Promise';
import { Source } from '../ReadableStream';
import ReadableStreamController from '../ReadableStreamController';

export default class EventedStreamSource implements Source<Event> {
	protected _controller: ReadableStreamController<Event>;
	protected _target: Evented | HTMLElement;
	protected _events: string[];
	// TODO: use Handle
	protected _handles: any[];

	constructor(target: Evented | HTMLElement, type: string | string[]) {
		this._target = target;

		// TODO: remove type assertions when tsc is fixed
		if (typeof type === 'string') {
			this._events = [ <string> type ];
		}
		else {
			this._events = <string[]> type;
		}

		this._handles = [];
	}

	start(controller: ReadableStreamController<Event>): Promise<void> {
		this._controller = controller;
		this._events.forEach((eventName: string) => {
			// TODO: remove type assertion
			this._handles.push(on(<any> this._target, eventName, this._handleEvent.bind(this)));
		});

		return Promise.resolve();
	}

	cancel(reason?: any): Promise<void> {
		while (this._handles.length) {
			// TODO: is it Handle.destroy? or Handle.remove()?
			this._handles.shift().remove();
		}

		return Promise.resolve();
	}

	protected _handleEvent(event: Event) {
		this._controller.enqueue(event);
	}
}
