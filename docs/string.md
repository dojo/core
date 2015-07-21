# string

* `codePointAt` - Returns the UTF-16 encoded code point value of a position in a string
* `endsWith` - Determines whether a string ends with the given substring
* `fromCodePoint` - Creates a string using the specified sequence of code points
* `includes` - Determines whether a string includes the given substring
* `repeat` - Returns a string containing a string repeated a given number of times
* `startsWith` - Determines whether a string begins with the given substring

Special thanks to Mathias Bynens for granting permission to adopt code from his
[`codePointAt`](https://github.com/mathiasbynens/String.prototype.codePointAt),
[`fromCodePoint`](https://github.com/mathiasbynens/String.fromCodePoint), and
[`repeat`](https://github.com/mathiasbynens/String.prototype.repeat) polyfills.

The `string` module also contains the following utility functions:

* `escapeRegExp` - Escapes a string to safely be included in regular expressions
* `escapeXml` - Escapes XML (or HTML) content in a string
* `padEnd` - Adds padding to the end of a string to ensure it is a certain length
* `padStart` - Adds padding to the beginning of a string to ensure it is a certain length
