export interface Handle {
	destroy(): void;
}

export interface EventObject {
    type: string|string[];
	bubbles?: boolean;
	cancelable?: boolean;
}
