import global from './global';
import Symbol from './Symbol';
import { IterableIterator, Iterable, ShimIterator } from './iterator';
import { hasClass } from './decorators';
import { forOf } from './iterator';

export namespace Shim {
	export class Set<T> {
		private _setData: T[] = [];

		constructor(iterable?: Iterable<T> | ArrayLike<T>) {
			if (iterable) {
				forOf(iterable, (value) => this.add(value));
			}
		};

		add(value: T): this {
			if (this.has(value)) {
				return this;
			}
			this._setData.push(value);
			return this;
		};

		clear(): void {
			this._setData.length = 0;
		};

		delete(value: T): boolean {
			const idx = this._setData.indexOf(value);
			if (idx === -1) {
				return false;
			}
			this._setData.splice(idx, 1);
			return true;
		};

		entries(): IterableIterator<[T, T]> {
			const ent = new ShimIterator(this._setData.map((value) => [ value, value ]));
			(<any> ent)[Symbol.iterator] = function (): IterableIterator<[T, T]> {
				return <any> ent;
			};
			return <any> ent;
		};

		forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void {
			const iterator = this.values();
			let result = iterator.next();
			while (!result.done) {
				callbackfn.call(thisArg, result.value, result.value, this);
				result = iterator.next();
			}
		};

		has(value: T): boolean {
			return this._setData.indexOf(value) > -1;
		};

		keys(): IterableIterator<T> {
			const keys = new ShimIterator(this._setData);
			(<any> keys)[Symbol.iterator] = function (): IterableIterator<T> {
				return <any> keys;
			};
			return <any> keys;
		};

		get size(): number {
			return this._setData.length;
		};

		values(): IterableIterator<T> {
			const values = new ShimIterator(this._setData);
			(<any> values)[Symbol.iterator] = function (): IterableIterator<T> {
				return <any> values;
			};
			return <any> values;
		};

		[Symbol.iterator](): IterableIterator<T> {
			const iterator = new ShimIterator(this._setData);
			(<any> iterator)[Symbol.iterator] = function (): IterableIterator<T> {
				return <any> iterator;
			};
			return <any> iterator;
		};

		[Symbol.toStringTag]: string = 'Set';
	}
}

@hasClass('es6-set', global.Set, Shim.Set)
export default class Set<T> {
	/* istanbul ignore next */
	constructor(iterable?: Iterable<T> | ArrayLike<T>) { };

	/* istanbul ignore next */
	add(value: T): this { throw new Error('Abstract method'); };
	/* istanbul ignore next */
	clear(): void { throw new Error('Abstract method'); };
	/* istanbul ignore next */
	delete(value: T): boolean { throw new Error('Abstract method'); };
	/* istanbul ignore next */
	entries(): IterableIterator<[T, T]> { throw new Error('Abstract method'); };
	/* istanbul ignore next */
	forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void { throw new Error('Abstract method'); };
	/* istanbul ignore next */
	has(value: T): boolean { throw new Error('Abstract method'); };
	/* istanbul ignore next */
	keys(): IterableIterator<T> { throw new Error('Abstract method'); };
	/* istanbul ignore next */
	get size(): number { throw new Error('Abstract method'); };
	/* istanbul ignore next */
	values(): IterableIterator<T> { throw new Error('Abstract method'); };
	/* istanbul ignore next */
	[Symbol.iterator](): IterableIterator<T> { throw new Error('Abstract method'); };
	/* istanbul ignore next */
	[Symbol.toStringTag]: string = 'Set';
}
