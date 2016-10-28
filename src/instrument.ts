import has from './has';

/**
 * The default message to warn when no other is provided
 */
const DEFAULT_DEPRECATED_MESSAGE = 'This function will be removed in future versions.';

export interface DeprecatedOptions {
	/**
	 * The message to use when warning
	 */
	message?: string;

	/**
	 * The name of the method or function to use
	 */
	name?: string;

	/**
	 * An alternative function to log the warning to
	 */
	warn?: (...args: any[]) => void;

	/**
	 * Reference an URL for more information when warning
	 */
	url?: string;
}

/**
 * Reference to console.warn
 */
let consoleWarn = console.warn;

/**
 * A function that will console warn that a function has been deprecated
 *
 * @param options Provide options which change the display of the message
 */
export function deprecated({ message, name, warn, url }: DeprecatedOptions = {}): void {
	if (has('debug')) {
		message = message || DEFAULT_DEPRECATED_MESSAGE;
		let warning = `DEPRECATED: ${name ? name + ': ' : ''}${message}`;
		if (url) {
			warning += `\n\n    See ${url} for more details.\n\n`;
		}
		(warn || consoleWarn)(warning);
	}
}

/**
 * A function that generates before advice that can be used to warn when an API has been deprecated
 *
 * @param options Provide options which change the display of the message
 */
export function deprecatedAdvice(options?: DeprecatedOptions): (...args: any[]) => any[] {
	return function(...args: any[]): any[] {
		deprecated(options);
		return args;
	};
}

/**
 * A method decorator that will console warn when a method if invoked that is deprecated
 *
 * @param options Provide options which change the display of the message
 */
export function deprecatedDecorator(options?: DeprecatedOptions): MethodDecorator {
	return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		if (has('debug')) {
			const { value: originalFn } = descriptor;
			options = options || {};
			/* IE 10/11 don't have the name property on functions */
			options.name = target.constructor.name ? `${target.constructor.name}#${propertyKey}` : propertyKey;
			descriptor.value = function(...args: any[]) {
				deprecated(options);
				return originalFn.apply(target, args);
			};
		}
		return descriptor;
	};
}

/**
 * Overwrite the console.warn, needed for some browsers which have issues when calling global objects.
 */
export function setConsoleWarn(warn: (message?: any, ...optionalParams: any[]) => void): void {
	consoleWarn = warn;
}
