import {ArrayLike} from './array';
import {is} from './object';

/**
 * An implementation of the ES2015 Map specification using arrays
 * instead of iterators. The iterator protocol is not implemented.
 */
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

	/**
	* Returns the value associated with a given key.
	*
	* @param key The key to look up
	* @return the value if one exists or undefined
	*/
	get(key: K): V {
		var index = this.indexOfKey(this.mapKeys, key);
		return index < 0 ? undefined : this.mapValues[index];
	}

	/**
	* Sets the value associated with a given key.
	*
	* @param key The key to define a value to
	* @param value The value to assign
	* @return A Map instance
	*/
	set(key: K, value: V): Map<K, V> {
		var index = this.indexOfKey(this.mapKeys, key);
		index = index < 0 ? this.mapKeys.length : index;
		this.mapKeys[index] = key;
		this.mapValues[index] = value;
		return this;
	}

	/**
	* Deletes a given key and its associated value.
	*
	* @param key The key to delete
	* @return true if the key exists, false if it does not
	*/
	delete(key: K): boolean {
		var index = this.indexOfKey(this.mapKeys, key);
		if (index < 0) {
			return false;
		}
		this.mapKeys.splice(index, 1);
		this.mapValues.splice(index, 1);
		return true;
	}

	/**
	* Checks for the presence of a given key.
	*
	* @param key The key to check for
	* @return true if the key exists, false if it does not
	*/
	has(key: K): boolean {
		return this.indexOfKey(this.mapKeys, key) > -1;
	}

	/**
	* Deletes all keys and their associated values.
	*/
	clear(): void {
		this.mapKeys.length = this.mapValues.length = 0;
	}

	/**
	* Returns an array of map keys in order of insertion.
	*
	* @return an array of keys in order of insertion
	*/
	keys(): K[] {
		return this.mapKeys;
	}

	/**
	* Returns an array of map values in order of insertion.
	*
	* @return an array of values in order of insertion
	*/
	values(): V[] {
		return this.mapValues;
	}

	/**
	* Returns an array of two-value tuples in the form
	* of [key, value] in order of insertion.
	*
	* @return an array of entries in order of insertion
	*/
	// TODO: change this any type to K, V tuple
	entries(): any {
		var entries: any[] = [];
		this.mapKeys.forEach(function (key: K) {
			entries.push([key, this.get(key)]);
		}, this);
		return entries;
	}

	/**
	* Executes a given function for each map entry.
	*
	* @param callback The function to execute for each map entry,
	* @param context The value to use for `this` for each execution
	* of the calbackv
	*/
	forEach(callback: () => any, context?: {}) {
		// don't use this.entries to avoid second forEach call
		this.mapKeys.forEach(function (key) {
			callback.call(context, [key, this.get(key)])
		});
	}

	/**
	* Creates a new Map
	*
	* @constructor
	*
	* @param iterable
	* An array of two-item tuples used to initially
	* populate the map. The first item in each tuple
	* corresponds to the key of the map entry. The second
	* item corresponds to the value of the map entry.
	*/
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
