# lang

# Module Exports

* assign

```ts
import { assign } from 'dojo/lang';

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
import { create } from 'dojo/lang';

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
import { deepAssign } from 'dojo/lang';

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

* deepMixin
* duplicate

```ts
import { duplicate } from 'dojo/lang';

var obj = {
	foo: 'bar'
};

var newObj = duplicate(old);

obj.foo = 'foo';

obj.foo === 'foo';
newObj.foo === 'bar';

```
