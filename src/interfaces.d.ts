export interface EventObject {
    type: string;
}

export interface Handle {
	destroy(): void;
}

export interface PausableHandle extends Handle {
	pause(): PausableHandle;
	resume(): PausableHandle;
}

export interface Hash<T> {
	[ key: string ]: T;
}
