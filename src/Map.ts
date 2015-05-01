import {ArrayLike} from './array';
import {is} from './object';

export class Map<K, V> {
	private mapKeys: K[] = [];

	private mapValues: V[] = [];
	
	/*
	 * An alternative to Array.prototype.indexOf using Object.is
	 * to check for equality. See http://mzl.la/1zuKO2V
	 */
	private indexOfKey(keys: K[], key: K): number {
		for (var i = 0; i < keys.length; i++) {
			if (is(keys[i], key)) {
				return i;
			}
		}
		return -1;
	}

	get(key: K): V {
		var index = this.indexOfKey(this.mapKeys, key);
		return index < 0 ? undefined : this.mapValues[index];
	}

	set(key: K, value: V): Map<K, V> {
		var index = this.indexOfKey(this.mapKeys, key);
		index = index < 0 ? this.mapKeys.length : index;
		this.mapKeys[index] = key;
		this.mapValues[index] = value;
		return this;
	}

	delete(key: K): boolean {
		var index = this.indexOfKey(this.mapKeys, key);
		if (index < 0) {
			return false;
		}
		this.mapKeys.splice(index, 1);
		this.mapValues.splice(index, 1);
		return true;
	}

	has(key: K): boolean {
		return this.indexOfKey(this.mapKeys, key) > -1;
	}

	clear(): void {
		this.mapKeys.length = this.mapValues.length = 0;
	}

	keys(): K[] {
		return this.mapKeys;
    }

	values(): V[] {
		return this.mapValues;
	}

	// TODO: change this any type to K, V tuple
	entries(): any {
		var entries: any[] = [];
		this.mapKeys.forEach(function (key: K) {
			entries.push([key, this.get(key)]);
		}, this);
		return entries;
    }

	forEach(callback: () => any, context?: {}) {
		// don't use this.entries to avoid second forEach call
		this.mapKeys.forEach(function (key) {
			callback.call(context, [key, this.get(key)])
		});
	}

	constructor(iterable: ArrayLike<[K, V]>) {
		if (!(this instanceof Map)) {
			throw new TypeError('Constructor Map requires "new"');
		}

		if (iterable) {
			// Can't depend on iterable protocol yet. Don't use
			// forEach so this works with array like objects too.
			for (let i = 0; i < iterable.length; i++) {
				this.set(iterable[i][0], iterable[i][1]);
			}
		}
	}
}
