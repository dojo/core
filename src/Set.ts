import has from './has';
import global from './global';
import Symbol from './Symbol';
import { IterableIterator, Iterable } from './iterator';

export namespace Shim {
	export interface Set<T> {
		add(value: T): Set<T>;
		clear(): void;
		delete(value: T): boolean;
		entries(): IterableIterator<[T, T]>;
		forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void;
		has(value: T): boolean;
		keys(): IterableIterator<T>;
		size: number;
		values(): IterableIterator<T>;
		[Symbol.iterator](): IterableIterator<T>;
		[Symbol.toStringTag]: string;
	}

	export interface SetConstructor {
		new (): Set<any>;
		new <T>(): Set<T>;
		new <T>(iterable: Iterable<T>): Set<T>;
		prototype: Set<any>;
	}

	export let Set: SetConstructor;

	Set = <any> function <T>(iterable?: Iterable<T>) {
		if (this instanceof Set) {
			throw new TypeError('TypeError: Set is not a constructor');
		}
	};
}

const Set: Shim.SetConstructor = has('es6-symbol') ? global.Symbol : Shim.Set;

export default Set;
