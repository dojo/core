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
import * as lang from 'src/lang'; // this imports all exports of the module as the object lang

import { lateBind, mixin } from 'src/lang'; // this imports lateBind and mixin from the module
```

#### Compile To JavaScript

Once downloaded, you can compile the TypesScript files by first installing the project dependencey with:

```
npm install
```

The by running this command:

```

node -e "require('grunt').tasks(['dev']);"

```

This will run the grunt 'dev' task.

## Features

### [Feature Detection](docs/has.md)

Using the latest Web technologies isn't always as straightforward as developers would like due to differing support
across platforms. `dojo-core/has` provides a simple feature detection API that makes it easy to detect which platforms
support which features.

### Language Utilities

The core package provides several modules offering a number of langauge utilities.  Some of these are heavily based
on methods in the ES2015 proposal; others are additional APIs for commonly-performed tasks.

#### [array](docs/array.md)

The `dojo-core/array` module contains analogues to some of the ES2015 Array APIs.

#### [lang](docs/lang.md)

The `dojo-core/lang` module contains various utility functions for tasks such as copying objects and creating late-bound
or partially applied functions.

#### [math](docs/math.md)

The `dojo-core/math` module contains analogues to a number of ES2015 APIs, including many trigonometric and logarithmic
functions.

#### [string](docs/string.md)

The `dojo-core/string` module contains analogues to the some of the ES2015 String APIs.

#### [UrlSearchParams](docs/UrlSearchParams.md)

The `dojo-core/UrlSearchParams` class can be used to parse and generate URL query strings.

#### [Event handling](docs/events.md)

The `dojo-core/on` module contains methods to handle events across types of listeners.  It also includes methods to handle different event use cases including only firing
once and pauseable events.

#### [HTTP requests](docs/requests.md)

The `dojo-core/request` module contains methods to simplify making http requests. It can handle
making requests in both node and the browser through the same methods.

### Promises and Asynchronous Operations

#### Promise

The `dojo-core/Promise` class is an implementation of the ES2015 Promise API that also includes static state inspection
and a `finally` method for cleanup actions.

`dojo-core/async` contains a number of classes and utility modules to simplify working with asynchronous operations.

#### Task

The `dojo-core/async/Task` class is an extension of `dojo-core/Promise` that provides cancelation support.

### Data Structures

#### [Map](docs/Map.md)

The `dojo-core/Map` class is an implementation of the ES2015 Map specification
without iterators for use in older browsers.

#### [WeakMap](docs/WeakMap.md)

The `dojo-core/WeakMap` class is an implementation of the ES2015 WeakMap specification
without iterators for use in older browsers.

#### [Date](docs/DateObject.md)

The `dojo-core/DateObject` class add some convenience methods around a JavaScript Date Object.

## How do I contribute?

We appreciate your interest!  Please see the [Guidelines Repository](https://github.com/dojo/guidelines#readme) for the
Contributing Guidelines and Style Guide.

## Licensing information

© 2004–2015 Dojo Foundation & contributors. [New BSD](http://opensource.org/licenses/BSD-3-Clause) license.

Some string functions (`codePointAt`, `fromCodePoint`, and `repeat`) adopted from polyfills by Mathias Bynens,
under the [MIT](http://opensource.org/licenses/MIT) license.

See [LICENSE](LICENSE) for details.
