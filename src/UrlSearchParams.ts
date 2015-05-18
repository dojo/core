import { duplicate } from './lang';

/**
 * A object with string keys and string or string array values that describes a query string.
 */
type ParamList = { [key: string]: string | string[] };

/**
 * Parse a query string, returning a ParamList object.
 */
function parseQueryString(input: string): ParamList {
	const query = <{ [key: string]: string[] }> {};
	input.split('&').forEach(entry => {
		let [ key, value ] = entry.split('=');
		key = key ? decodeURIComponent(key) : '';
		value = value ? decodeURIComponent(value) : '';

		if (key in query) {
			query[key].push(value);
		}
		else {
			query[key] = [ value ];
		}
	});
	return query;
}

/**
 * An class that represents a URL query search parameters.
 */
export default class UrlSearchParams {
	/**
	 * Construct a new UrlSearchParams from a query string, an object of parameters and values, or anoter
	 * UrlSearchParams.
	 */
	constructor(input?: string | ParamList | UrlSearchParams) {
		let list: ParamList;

		if (input instanceof UrlSearchParams) {
			// Copy the incoming UrlSearchParam's internal list
			list = <ParamList> duplicate(input.list);
		}
		else if (typeof input === 'object') {
			// Copy the incoming object, assuming its property values are either arrays or strings
			list = {};
			for (var key in input) {
				const value = (<ParamList> input)[key];

				if (Array.isArray(value)) {
					list[key] = value.length ? value.slice() : [ '' ];
				}
				else if (value == null) {
					list[key] = [ '' ];
				}
				else {
					list[key] = [ <string> value ];
				}
			}
		}
		else if (typeof input === 'string') {
			// Parse the incoming string as a query string
			list = parseQueryString(input);
		}
		else {
			list = {};
		}

		Object.defineProperty(this, 'list', { value: list });
	}

	/**
	 * The internal list maps property keys to arrays of values. The value for any property that has been set will be an
	 * array containing at least one item. Properties that have been deleted will have a value of 'undefined'.
	 */
	private list: { [key: string]: string[] };

	/**
	 * Append a new value to the set of values for a key.
	 */
	append(key: string, value: string): void {
		if (!this.has(key)) {
			this.set(key, value);
		}
		else {
			this.list[key].push(value);
		}
	}

	/**
	 * Delete all values for a key.
	 */
	delete(key: string): void {
		this.list[key] = undefined;
	}

	/**
	 * Get the first value associated with a key.
	 */
	get(key: string): string {
		if (!this.has(key)) {
			return null;
		}
		return this.list[key][0];
	}

	/**
	 * Get all the values associated with a key.
	 */
	getAll(key: string): string[] {
		if (!this.has(key)) {
			return null;
		}
		return this.list[key];
	}

	/**
	 * Return true if a key has been set to any value.
	 */
	has(key: string): boolean {
		return Array.isArray(this.list[key]);
	}

	/**
	 * Set the value associated with a key.
	 */
	set(key: string, value: string): void {
		this.list[key] = [ value ];
	}

	/**
	 * Return this objects data as an encoded query string.
	 */
	toString(): string {
		const query = <string[]> [];

		for (let key in this.list) {
			if (!this.has(key)) {
				continue;
			}

			const values = this.list[key];
			const encodedKey = encodeURIComponent(key);
			for (let i = 0; i < values.length; i++) {
				const value = values[i];
				query.push(encodedKey + (value ? ('=' + encodeURIComponent(value)) : ''));
			}
		}

		return query.join('&');
	}
}
