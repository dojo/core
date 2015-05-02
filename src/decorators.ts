/**
 * A property decorator that creates a non-enumerable property.
 */
export function hidden(target: Object, key: string): void {
	// Define a non-enumerable property on the prototype
	Object.defineProperty(target, key, {
		enumerable: false,

		set: function (value) {
			// The first time the property is set on an instance, define a non-enumerable property on the instance
			Object.defineProperty(this, key, {
				enumerable: false,
				writable: true,
				value: value
			});
		}
	});
}
