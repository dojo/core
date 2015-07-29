# lang

# Module Exports

* assign

```ts
import { assign } from 'src/lang';

var target = {
	foo: 'bar'
};

var source = {
	bar: 'foo'
};

assign(target, source);

target.foo === 'bar'; // true
target.bar === 'foo'; // true

```

* create

```ts
import { create } from 'src/lang';

var oldObj = {
	foo: 'bar',
	obj: {
		bar: 'foo'
	}
};

var newObj = create(oldObj, {
	bar: 'foo'
});

newObj.bar === 'foo'; // true
newObj.foo === 'bar'; // true
newObj.obj.bar === 'foo'; // true

oldObj.foo = 'foo';
oldObj.obj.bar = 'bar';

newObj.foo === 'bar'; // true
newObj.obj.bar === 'bar'; // true
```

* deepAssign

```ts
import { deepAssign } from 'src/lang';

var oldObj = {
	foo: 'bar',
	obj: {
		bar: 'foo'
	}
};

var newObj = deepAssign(oldObj, {
	bar: 'foo'
});

newObj.bar === 'foo'; // true
newObj.foo === 'bar'; // true
newObj.obj.bar === 'foo'; // true

oldObj.foo = 'foo';
oldObj.obj.bar = 'bar';

newObj.foo === 'bar'; // true
newObj.obj.bar === 'bar'; // true
```
* mixin
```ts
import { mixin } from 'src/lang';

const obj = {
	foo: 'bar',
	fooObj: {
		bar: 'foo'
	}
};

const result = mixin({}, obj);

result.foo === 'bar'; // true
result.fooObj.bar === 'foo'; // true

obj.fooObj.bar = 'bar';

result.fooObj.bar === 'bar'; // true

```

* deepMixin
```ts
import { deepMixin } from 'src/lang';

const obj = {
	foo: 'bar',
	fooObj: {
		bar: 'foo'
	}
};

const result = deepMixin({}, obj);

result.foo === 'bar'; // true
result.fooObj.bar === 'foo'; // true

obj.fooObj.bar = 'bar';

result.fooObj.bar === 'bar'; // false
result.fooObj.bar === 'foo'; // true

```
* duplicate

```ts
import { duplicate } from 'src/lang';

var obj = {
	foo: 'bar'
};

var newObj = duplicate(old);

obj.foo = 'foo';

obj.foo === 'foo';
newObj.foo === 'bar';

```

* partial
