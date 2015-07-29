# WeakMap

An implementation analogous to the WeakMap specification in ES2015,
with the exception of iterators. The main difference between WeakMap and Map
that WeakMap's keys can only be objects and that the store has a weak reference
to the key/value pair. This allows for the garbage collector to remove pairs.

Look at [Map](docs/Map.md) for more information on how to use WeakMap.
