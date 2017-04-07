import { EventedListenerOrArray } from '@dojo/interfaces/bases';
import { Handle } from '@dojo/interfaces/core';
import { BaseEventedEvents, Evented } from '../Evented';
import { UploadEvent } from './interfaces';

export interface UploadObserverEvents extends BaseEventedEvents {
	(type: 'upload', handler: EventedListenerOrArray<Evented, UploadEvent>): Handle;
}

export default class UploadObserver extends Evented {
	constructor() {
		super();
	}

	on: UploadObserverEvents;
}
