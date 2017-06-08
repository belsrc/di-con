# Di-Con [WIP]

Simple IoC container library.

### Install
```bash
npm i -S di-con
```

```javascript
const container = require('di-con');
```

### Simple Classes

With simple classes you simply ```bind``` and ```make``` them.

```javascript
class ClassEx {
  talk() {
    return 'Hello World';
  }
}

container.bind('ClassEx', ClassEx);

const example = container.make('ClassEx');

console.log(example.talk());
// Hello World
```

Each time ```make``` is called for a class binding it will get a new instance of that class.

```javascript
const exampleOne = container.make('ClassEx');
const exampleTwo = container.make('ClassEx');

console.log(exampleOne === exampleTwo);
// false
```

### Dependencies

If the class needs dependencies you simply chain them onto the binding using the ```depends``` method. When ```make``` is called it will loop through the dependencies and try to resolve them.
It first checks the other bound items, then it checks to see if it can ```require``` it from node_modules. If it can't find it in either of those places it just uses it as a literal.

```javascript
class DependEx {
  constructor(one, two, three, four, five) {
    this.one = one;
    this.two = two;
    this.three = three;
    this.four = four;
    this.five = five;
  }

  showDeps() {
    console.log(this.one);
    console.log(this.two);
    console.log(this.three);
    console.log(this.four);
    console.log(this.five);
  }
}

container.bind('DependEx', DependEx).depends('Foo', 23, { name: 'World' }, 'ClassEx', 'moment');

const depend = container.make('DependEx');

depend.showDeps();
// Foo                 -- No other bindings or node_modules, use literal
// 23                  -- Not a string, use literal
// { name: 'World' }   -- Not a string, use literal
// ClassEx {}          -- Found in bindings
// Moment {}           -- Found in node_modules
```

```depends``` saves its arguments as they are provided and injects them into the constructor in the same order.

### Singletons

Like with dependencies, to make a singleton just chain the binding with the ```singleton``` method.

```javascript
class SingleEx {
  constructor() {
    this.time = new Date();
  }

  getTime() {
    return this.time;
  }
}

container.bind('SingleEx', SingleEx).singleton();

const singleOne = container.make('SingleEx');
const singleTwo = container.make('SingleEx');

console.log(singleOne === singleTwo);
// true

console.log(singleOne.getTime());
console.log(singleTwo.getTime());
// Wed Jun 07 2017 16:16:40 GMT-0400 (EDT)
// Wed Jun 07 2017 16:16:40 GMT-0400 (EDT)
```

You can also, of course, chain off the ```depends``` method as well to make a singleton ```container.bind('', {}).depends('', '').singleton()```

### Types

When binding a value, an attempt is made to infer the type of the value given, ```class``` or ```factory```. In the case of prototype constructor functions that doesn't necessarily work well. So you have the ability to tell the container what type you want the value to be treated as using the ```as``` method. There are three available types: ```class```, ```factory```, ```singleton```.

```javascript
function ProtoEx() {}
ProtoEx.prototype.yell = function() {
  console.log('HEEEY!');
};

container.bind('ProtoEx', ProtoEx).as('class');

const proto = container.make('ProtoEx');

proto.yell();
// HEEEY!
```

### Factories

Factory functions can also be bound to the container. Instead of giving a class constructor as the second argument, you give a function. The function will be called when you ```make``` it.

```javascript
class CounterEx {
  constructor() {}

  count() {
    return 5;
  }
}

container.bind('Counter', CounterEx);

container.bind('Func', () => {
  const counter = container.make('Counter');
  return 5 * counter.count();
});

console.log(container.make('Func'));
// 25
```

Thats nice for simple functions but kind of useless for most stuff, so instead of giving the binding a function that returns a value, you can give it a function that returns a function.

```javascript
class CounterEx {
  constructor() {}

  count() {
    return 5;
  }
}

container.bind('Counter', CounterEx);

container.bind('FuncArg', () => val => {
  const counter = container.make('Counter');
  return val * counter.count();
});

const funcArg = container.make('FuncArg');

console.log(funcArg(6));
// 30

console.log(funcArg(10));
// 50
```

### API

#### Container

##### register(name:String, value:Mixed)
Register a binding with the container. Returns a new ```Binding```.

##### bind(name:String, value:Mixed)
An alias for ```register```.

##### resolve(name:String)
Resolves the given binding name.

##### make(name:String)
An alias for ```resolve```.

##### rebind(name:String, value:Mixed)
Rebind an item that is already on the container. Returns a new ```Binding```.

##### forgetInstance(name:String)
Remove a resolved shared instance from the instance cache.

##### forgetAllSharedInstances()
Clear all of the shared instances from the container.

##### flush()
Flush the container of all bindings and instances.

##### isBound(name:String)
Determine if the given item has been bound.

##### isShared(name:String)
Determine if a given item is shared.

##### isFactory(name:String)
Determine if a given item is a factory.


#### Binding

##### singleton()
Mark the binding as a singleton. Returns the ```Binding```.

##### depends(...args:Mixed)
Set the dependencies for the binding. Returns the ```Binding```.

##### as(type:String)
Set the type of the binding. Returns the ```Binding```.


#### License

  di-con is licensed under the DBAD license.

  Copyright (c) 2017 Bryan Kizer

   Everyone is permitted to copy and distribute verbatim or modified
   copies of this license document.

  > DON'T BE A DICK PUBLIC LICENSE
  > TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

   1. Do whatever you like with the original work, just don't be a dick.

       Being a dick includes - but is not limited to - the following instances:

     1a. Outright copyright infringement - Don't just copy this and change the name.  
     1b. Selling the unmodified original with no work done what-so-ever, that's REALLY being a dick.  
     1c. Modifying the original work to contain hidden harmful content. That would make you a PROPER dick.  

   2. If you become rich through modifications, related works/services, or supporting the original work,
   share the love. Only a dick would make loads off this work and not buy the original work's
   creator(s) a pint.

   3. Code is provided with no warranty. Using somebody else's code and bitching when it goes wrong makes
   you a DONKEY dick. Fix the problem yourself. A non-dick would submit the fix back.
