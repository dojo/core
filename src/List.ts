import { forOf, Iterable, IterableIterator, ShimIterator } from 'dojo-shim/iterator';

export default class List<T> {
	private _items: T[];

	[Symbol.iterator]() {
		return this.values();
	}

	get size(): number {
		return this._items.length;
	}

	constructor(source?: Iterable<T> | ArrayLike<T>) {
		this._items = [];

		if (source) {
			forOf(source, (item: T) => {
				this.add(item);
			});
		}
	}

	add(value: T): this {
		this._items.push(value);
		return this;
	}

	clear(): void {
		this._items = [];
	}

	delete(idx: number): boolean {
		if (idx < this._items.length) {
			this._items.splice(idx, 1);
			return true;
		}

		return false;
	}

	entries(): IterableIterator<[number, T]> {
		return new ShimIterator<[number, T]>(this._items.map<[number, T]>((value, index) => [ index, value ]));
	}

	forEach(fn: (value: T, idx: number, list: this) => void, thisArg?: any): void {
		this._items.forEach(fn.bind(thisArg ? thisArg : this));
	}

	has(idx: number): boolean {
		return this._items.length > idx;
	}

	includes(value: T): boolean {
		return this._items.indexOf(value) >= 0;
	}

	indexOf(value: T): number {
		return this._items.indexOf(value);
	}

	join(separator: string = ','): string {
		return this._items.join(separator);
	}

	keys(): IterableIterator<number> {
		return new ShimIterator<number>(this._items.map<number>((_, index) => index));
	}

	lastIndexOf(value: T): number {
		return this._items.lastIndexOf(value);
	}

	push(value: T): void {
		this.add(value);
	}

	pop(): T | undefined {
		return this._items.pop();
	}

	splice(start: number, deleteCount?: number, ...newItems: T[]): T[] {
		return this._items.splice(start,
			deleteCount === undefined ? (this._items.length - start) : deleteCount,
			...newItems
		);
	}

	values(): IterableIterator<T> {
		return new ShimIterator<T>(this._items.map<T>((value) => value));
	}
}
