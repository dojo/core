import has from './has';
import { Handle, Hash } from './interfaces';
import { PropertyEvent, Observer } from './observers/interfaces';
import * as ObjectObserver from './observers/ObjectObserver';

const slice = Array.prototype.slice;
const hasOwnProperty = Object.prototype.hasOwnProperty;

function isObject(item: any): boolean {
	return item && typeof item === 'object' && !Array.isArray(item) && !(item instanceof RegExp);
}

function copyArray(array: any[], inherited: boolean): any[] {
	return array.map(function (item: any): any {
		if (Array.isArray(item)) {
			return copyArray(item, inherited);
		}

		return !isObject(item) ?
			item :
			_mixin({
				deep: true,
				inherited: inherited,
				sources: [ item ],
				target: {}
			});
	});
}

interface MixinArgs {
	deep: boolean;
	inherited: boolean;
	sources: {}[];
	target: {};
}

function _mixin(kwArgs: MixinArgs): {} {
	const deep = kwArgs.deep;
	const inherited = kwArgs.inherited;
	const target = kwArgs.target;

	for (let source of kwArgs.sources) {
		for (let key in source) {
			if (inherited || hasOwnProperty.call(source, key)) {
				let value: any = (<any> source)[key];

				if (deep) {
					if (Array.isArray(value)) {
						value = copyArray(value, inherited);
					}
					else if (isObject(value)) {
						value = _mixin({
							deep: true,
							inherited: inherited,
							sources: [ value ],
							target: {}
						});
					}
				}

				(<any> target)[key] = value;
			}
		}
	}

	return target;
}

/**
 * Copies the values of all enumerable own properties of one or more source objects to the target object.
 * @return The modified target object.
 */
export function assign(target: {}, ...sources: {}[]): {} {
	return _mixin({
		deep: false,
		inherited: false,
		sources: sources,
		target: target
	});
}

/**
 * Creates a new object from the given prototype, and copies all enumerable own properties of one or more
 * source objects to the newly created target object.
 * @return The new target object.
 */
export function create(prototype: {}, ...mixins: {}[]): {} {
	if (!mixins.length) {
		throw new RangeError('lang.create requires at least one mixin object.');
	}

	const args = mixins.slice(0);
	args.unshift(Object.create(prototype));

	return assign.apply(null, args);
}

/**
 * Copies the values of all enumerable own properties of one or more source objects to the target object,
 * recursively copying all nested objects and arrays as well.
 * @return The modified target object.
 */
export function deepAssign(target: {}, ...sources: {}[]): {} {
	return _mixin({
		deep: true,
		inherited: false,
		sources: sources,
		target: target
	});
}

/**
 * Copies the values of all enumerable properties of one or more source objects to the target object,
 * recursively copying all nested objects and arrays as well.
 * @return The modified target object.
 */
export function deepMixin(target: {}, ...sources: {}[]): {} {
	return _mixin({
		deep: true,
		inherited: true,
		sources: sources,
		target: target
	});
}

/**
 * Creates a new object using the provided source's prototype as the prototype for the new object, and then
 * deep copies the provided source's values into the new target.
 * @return The new target object.
 */
export function duplicate(source: {}): {} {
	const target = Object.create(Object.getPrototypeOf(source));

	return deepMixin(target, source);
}

/**
 * Determines whether two values are the same value.
 * @return true if the values are the same; false otherwise.
 */
export function isIdentical(a: any, b: any): boolean {
	return a === b ||
		/* both values are NaN */
		(a !== a && b !== b);
}

/**
 * Returns a function that binds a method to the specified object at runtime. This is similar to
 * `Function.prototype.bind`, but instead of a function it takes the name of a method on an object.
 * As a result, even should the underlying function change, the function returned by `lateBind` will
 * always call it in the context of the original object.
 *
 * @param instance The context object.
 * @param method The name of the method that should be bound to `instance`.
 * @param {...suppliedArgs} An optional list of values to prepend to the `instance[methods]` arguments list.
 * @return The bound function.
 */
export function lateBind(instance: {}, method: string, ...suppliedArgs: any[]): (...args: any[]) => any {
	return suppliedArgs.length ?
		function () {
			const args: any[] = arguments.length ? suppliedArgs.concat(slice.call(arguments)) : suppliedArgs;

			// TS7017
			return (<any> instance)[method].apply(instance, args);
		} :
		function () {
			// TS7017
			return (<any> instance)[method].apply(instance, arguments);
		};
}

/**
 * Copies the values of all enumerable properties of one or more source objects to the target object.
 * @return The modified target object.
 */
export function mixin(target: {}, ...sources: {}[]): {} {
	return _mixin({
		deep: false,
		inherited: true,
		sources: sources,
		target: target
	});
}

export function observe(kwArgs: ObserveArgs): Observer {
	const Ctor = kwArgs.nextTurn && has('object-observe') ? ObjectObserver.Es7Observer : ObjectObserver.Es5Observer;

	return new Ctor(kwArgs);
}

export interface ObserveArgs {
	listener: (events: PropertyEvent[]) => any;
	nextTurn?: boolean;
	onlyReportObserved?: boolean;
	target: {}
}

/**
 * Similar to `Function.prototype.bind` but always calls its function within the current context.
 *
 * @param targetFunction The function that needs to be bound.
 * @param {...suppliedArgs} An optional list of values to prepend to the `targetFunction` arguments list.
 * @return The bound function.
 */
export function partial(targetFunction: (...args: any[]) => any, ...suppliedArgs: any[]): (...args: any[]) => any {
	return function () {
		const args: any[] = arguments.length ? suppliedArgs.concat(slice.call(arguments)) : suppliedArgs;

		return targetFunction.apply(this, args);
	};
}

/**
 * Returns an object with a destroy method that, when called, calls the passed-in destructor.
 * This is intended to provide a unified interface for creating "remove"/"destroy" handlers for
 * event listeners, timers, etc.
 *
 * @param destructor A function that will be called when the handle's `destroy` method is invoked.
 * @return The handle object.
 */
export function createHandle(destructor: () => void): Handle {
	return {
		destroy: function () {
			this.destroy = function () {};
			destructor.call(this);
		}
	};
}

/**
 * Returns a single handle that can be used to destroy multiple handles simultaneously.
 *
 * @param {...handles} A list of handles with `destroy` methods.
 * @return The handle object.
 */
export function createCompositeHandle(...handles: Handle[]): Handle {
	return createHandle(function () {
		for (let handle of handles) {
			handle.destroy();
		}
	});
}
