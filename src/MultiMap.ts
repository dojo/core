import Symbol from '@dojo/shim/Symbol';
import Map from '@dojo/shim/Map';
import { ArrayLike } from '@dojo/shim/interfaces';
import { forOf, Iterable, IterableIterator, ShimIterator } from '@dojo/shim/iterator';

export default class MultiMap<T> {
	private _map: Map<any, any>;
	private _key: symbol;

	constructor(iterable?: ArrayLike<[any[], any]> | Iterable<[any[], any]>) {
		this._map = new Map<any, any>();
		this._key = Symbol();
		if (iterable) {
			forOf(iterable, (value: [any[], any]) => {
				this.set(value[0], value[1]);
			});
		}
	}

	set(keys: any[], value: T): MultiMap<T> {
		let map = this._map;
		let childMap;

		for (let i = 0; i < keys.length; i++) {
			if (map.get(keys[i])) {
				map = map.get(keys[i]);
				continue;
			}
			childMap = new Map<any, any>();
			map.set(keys[i], childMap);
			map = childMap;
		};

		map.set(this._key, value);
		return this;
	}

	get(keys: any[]): T | undefined {
		let map = this._map;

		for (let i = 0; i < keys.length; i++) {
			map = map.get(keys[i]);

			if (!map) {
				return undefined;
			}
		};

		return map.get(this._key);
	}

	has(keys: any[]): boolean {
		let map = this._map;

		for (let i = 0; i < keys.length; i++) {
			map = map.get(keys[i]);
			if (!map) {
				return false;
			}
		}
		return true;
	}

	delete(keys: any[]): boolean {
		let map = this._map;
		const path = [this._map];

		for (let i = 0; i < keys.length; i++) {
			map = map.get(keys[i]);
			path.push(map);
			if (!map) {
				return false;
			}
		}

		map.delete(this._key);

		for (let i = keys.length - 1; i >= 0; i--) {
			map = path[i].get(keys[i]);
			if (map.size) {
				break;
			}
			path[i].delete(keys[i]);
		}

		return true;
	}

	values(): IterableIterator<T> {
		const values: T[] = [];

		const getValues = (map: Map<any, any>) => {
			map.forEach((value, key) => {
				if (key === this._key) {
					values.push(value);
				}
				else {
					getValues(value);
				}
			});
		};

		getValues(this._map);
		return new ShimIterator<T>(values);
	}

	keys(): IterableIterator<any[]> {
		const finalKeys: any[][] = [];

		const getKeys = (map: Map<any, any>, keys: any[] = []) => {
			map.forEach((value, key) => {
				if (key === this._key) {
					finalKeys.push(keys);
				}
				else {
					const nextKeys = [...keys, key];
					getKeys(value, nextKeys);
				}
			});
		};

		getKeys(this._map);
		return new ShimIterator<any[]>(finalKeys);
	}

	entries(): IterableIterator<[any[], T]> {
		const finalEntries: [ any[], T ][] = [];

		const getKeys = (map: Map<any, any>, keys: any[] = []) => {
			map.forEach((value, key) => {
				if (key === this._key) {
					finalEntries.push([ keys, value ]);
				}
				else {
					const nextKeys = [...keys, key];
					getKeys(value, nextKeys);
				}
			});
		};

		getKeys(this._map);
		return new ShimIterator<[any[], T]>(finalEntries);
	}

	forEach(callback: (value: T, key: any[], mapInstance: MultiMap<T>) => any, context?: {}) {
		const entries = this.entries();

		forOf(entries, (value: [any[], T]) => {
			callback.call(context, value[1], value[0], this);
		});
	}

	clear() {
		this._map.clear();
	}
}
