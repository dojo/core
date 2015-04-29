function callCatch(func: () => any) {
	var threw: boolean;
	try {
		func();
	} catch (e) {
		threw = true;
	}
	return threw;
}

/**
 * Allows for the addition to, or modification of, a property on an object.
 *
 * @param target the object to add a property to
 * @param prop the property to add
 * @param descriptor the configuration object for the property being added
 * @return true if the property was added to the object without error,
 * false otherwise
 */
export function defineProperty(target: {}, prop: string, descriptor: {}): boolean {
	if (typeof target !== 'object') {
		throw new TypeError('target must be an object');
	}
	return callCatch(function () {
		Object.defineProperty(target, prop, descriptor);
	});
}

/**
 * Deletes a property from an object.
 *
 * @param target the object to add a property to
 * @param prop the property to add
 * @return true if the property was deleted from the object without error,
 * false otherwise
 */
export function deleteProperty(target: any, prop: string): boolean {
	if (typeof target !== 'object') {
		throw new TypeError('target must be an object');
	}

	var descriptor = Object.getOwnPropertyDescriptor(target, prop);

    if (descriptor && !descriptor.configurable) {
      return false;
    }

	return delete target[prop];
}

/**
 * Retrieves the property descriptor on an object not resulting from
 * its protoype
 *
 * @param target the object to add a property to
 * @param prop the property to add
 * @return the property descriptor the target object
 */
export function getOwnPropertyDescriptor(target: {}, prop: string): {} {
	if (typeof target !== 'object') {
		throw new TypeError('target must be an object');
	}
	return Object.getOwnPropertyDescriptor(target, prop);
}

/**
 * Retrieves the prototype of an object
 *
 * @param target the object from which to retrieve a protoype
 * @return the property descriptor the target object
 */
export function getPrototypeOf(target: {}): {} {
	if (typeof target !== 'object') {
		throw new TypeError('target must be an object');
	}
	return Object.getPrototypeOf(target);
}

/**
 * Checks for the presence of property on a target object
 *
 * @param target the object to check for property
 * @param prop the property to check for
 * @return true if the property exists on the target object, false otherwise
 */
export function has(target: {}, prop: string): boolean {
	if (typeof target !== 'object') {
		throw new TypeError('target must be an object');
	}
	return prop in target;
}

/**
 * Determins whether an object can have new properties added to it
 *
 * @param target the object to check for extensibility
 * @return true if the object is extensible, false otherwise
 */
export function isExtensible(target: {}): boolean {
	if (typeof target !== 'object') {
		throw new TypeError('target must be an object');
	}
	return Object.isExtensible(target);
}

/**
 * Determins whether an object can have new properties added to it
 *
 * @param target the object from which to retrieve own properties
 * @return an array containing the target object's own properties
 */
export function ownKeys(target: {}): string[] {
	if (typeof target !== 'object') {
		throw new TypeError('target must be an object');
	}
	return Object.getOwnPropertyNames(target);
}

/**
 * Prevents new properties from being added to the target object
 *
 * @param target the object to prevent properties from being added to
 * @return true or false indicating whether the prevention succeeded
 */
export function preventExtensions(target: {}): boolean {
	if (typeof target !== 'object') {
		throw new TypeError('target must be an object');
	}
	return callCatch(function () {
		Object.preventExtensions(target);
	});
}

/**
 * Calls a target function with arguments as specified by the args parameter
 * with a specified context context
 *
 * @param func the function to call
 * @param thisArg the context in which to run the function
 * @param args arguments to pass the function during execution
 * @return the result of the function call
 */
export function apply(func: () => any, thisArg: {}, args: any[]): boolean {
	if (typeof func !== 'function') {
		throw new TypeError(func + 'is not a function');
	}
	args = args || []
	return func.apply(thisArg, args);
}

/**
 * Sets a new prototype on the target object
 *
 * @param target the object set a new prototype on
 * @param proto the protoype
 * @return true or false indicating whether the prototype setting succeeded
 */
export function setPrototypeOf(target: any, proto?: {}): boolean {
	if (typeof target !== 'object') {
		throw new TypeError('target must be an object');
	}

	if (proto !== null && typeof proto !== 'object') {
		throw new TypeError('prototype must be an object or null');
	}

	if (!isExtensible(target)) {
		return false;
	}

	if (proto === getPrototypeOf(target)) {
      return true;
    }

	// Prevent circular prototype chains
	// See http://mzl.la/1QJiuiE
	while (proto) {
		if (target === proto) {
			return false;
		}
		proto = getPrototypeOf(proto);
	}

	target.prototype = proto;

	return true;
}
