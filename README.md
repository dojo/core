# Dojo 2 core

This package provides a set of language helpers, utility functions, and classes for writing TypeScript applications.
It includes APIs for feature detection, asynchronous and streaming operations, basic event handling,
and making HTTP requests.

## Installation

This package is currently in Alpha with a initial stable release scheduled for later this year. You can install the Alpha
through npm:

```
npm install dojo@2.0.0-alpha4
```

You can also clone or download this repository.

## Dojo Usage

### npm

If using npm, you can access modules by using ```require``` like so:

```ts
import lang = require('dojo/lang');
```

### Downloading

To access modules use after cloning or downloading the repository, you can reference it by:

```ts
import lang from 'src/lang'; // this imports all exports of the module to lang

import { lateBind, mixin } from 'src/lang'; // this imports lateBind and mixin from the module
```

## Features

### Feature Detection

Using the latest Web technologies isn't always as straightforward as developers would like due to differing support
across platforms. `dojo-core/has` provides a simple feature detection API that makes it easy to detect which platforms
support which features.

### Language Utilities

The core package provides several modules offering a number of langauge utilities.  Some of these are heavily based
on methods in the ES2015 proposal; others are additional APIs for commonly-performed tasks.

#### [array](docs/array.md)

The `array` module contains analogues to some of the ES2015 Array APIs.

#### [lang](docs/lang.md)

The `lang` module contains various utility functions for tasks such as copying objects and creating late-bound
or partial applications of functions.

#### [math](docs/math.md)

The `math` module contains analogues to a number of ES2015 APIs, including many trigonometric and logarithmic
functions.

#### [string](docs/string.md)

The `string` module contains analogues to the some of the ES2015 String APIs.

#### [UrlSearchParams](docs/UrlSearchParams.md)

The `UrlSearchParams` class can be used to parse and generate URL query strings.

### Promises and Asynchronous Operations

#### Promise

The `dojo-core/Promise` class is an implementation of the ES2015 Promise API that also includes static state inspection
and a `finally` method for cleanup actions.

`dojo-core/async` contains a number of classes and utility modules to simplify working with asynchronous operations.

#### Task

The `dojo-core/async/Task` class is an extension of `dojo-core/Promise` that provides cancelation support.

## How do I contribute?

We appreciate your interest!  Please see the [Guidelines Repository](https://github.com/dojo/guidelines#readme) for the
Contributing Guidelines and Style Guide.

## Licensing information

© 2004–2015 Dojo Foundation & contributors. [New BSD](http://opensource.org/licenses/BSD-3-Clause) license.

Some string functions (`codePointAt`, `fromCodePoint`, and `repeat`) adopted from polyfills by Mathias Bynens,
under the [MIT](http://opensource.org/licenses/MIT) license.

See [LICENSE](LICENSE) for details.
