import {ArrayLike} from './array';
import {is} from './object';

export class Map<K, V> {
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

	keys: K[] = [];
	values: V[] = [];

	set(key: K, value: V): Map<K, V> {
		var index = this.indexOfKey(this.keys, key);
		index = index < 0 ? this.keys.length : index;
		this.keys[index] = key;
		this.values[index] = value;
		return this;
	}

	clear(): void {
		this.keys.length = this.values.length = 0;
	}

	delete(key: K): boolean {
		var index = this.indexOfKey(this.keys, key);
		if (index < 0) {
			return false;
		}
		this.keys.splice(index, 1);
		this.values.splice(index, 1);
		return true;
	}

	entries(): any[] {
		var entries: any[] = [];
		this.keys.forEach(function (key) {
			entries.push([key, this.get(key)]);
		}, this);
		return entries;
    }

	forEach(callback: () => any, context?: {}) {
		
	}

	// Can we type this stronger?
	constructor(iterable: ArrayLike<[K, V]>) {
		if (!(this instanceof Map)) {
			throw new TypeError('Constructor Map requires "new"');
		}

		if (iterable) {
			// Can't depend on iterable protocol yet. Don't use
			// forEach so this works with ArrayLike objects too.
			for (let i = 0; i < iterable.length; i++) {
				this.set(iterable[i][0], iterable[i][1]);
			}
		}
	}
}
