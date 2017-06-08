'use strict';

const Binding = require('./binding');

let bindings = {};
let instances = {};

/**
 * Get an instance of the given class.
 * @private
 * @param  {String}  name       The item key name.
 * @param  {Object}  container  The container object.
 * @return {Mixed}
 */
function getClass(name, container) {
  const binding = bindings[name];

  if(binding.dependencies.length) {
    const deps = binding.dependencies.map(d => {
      // If the dep is a string try to resolve it
      // otherwise, it is a literal value and use that
      if(typeof d == 'string' || d instanceof String) {
        try {
          return container.make(d);
        }
        catch(error) {
          return d;
        }
      }

      return d;
    });

    // apply dependecies to new bindings[name]
    return new (Function.prototype.bind.apply(binding.value, [null].concat(deps)));
  }

  return new binding.value();
}

/**
 * Get the given singleton instance.
 * @private
 * @param  {String}  name       The item key name.
 * @param  {Object}  container  The container object.
 * @return {Mixed}
 */
function getSingleton(name, container) {
  if(!instances.hasOwnProperty(name)) {
    const instance = getClass(name, container);

    instances[name] = instance;
  }

  return instances[name];
}

/**
 * Call the given bound factory function.
 * @private
 * @param  {String}  name       The item key name.
 * @return {Mixed}
 */
function callFactory(name) {
  return bindings[name].value();
}


class Container {
  /**
   * Determine if the given item has been bound.
   * @param  {String}  name  Binding name string.
   * @return {Boolean}
   */
  isBound(name) {
    return bindings.hasOwnProperty(name);
  }

  /**
   * Determine if a given item is shared.
   * @param  {String}  name  Item name string.
   * @return {Boolean}
   */
  isShared(name) {
    if(!this.isBound(name)) {
      return false;
    }

    return bindings[name].type === 'singleton';
  }

  /**
   * Determine if a given item is a factory.
   * @param  {String}  name  Item name string.
   * @return {Boolean}
   */
  isFactory(name) {
    if(!this.isBound(name)) {
      return false;
    }

    return bindings[name].type === 'factory';
  }

  /**
   * Get a list of the normal class bindings.
   * @return {Array}
   */
  getClassBindings() {
    return Object.keys(bindings)
      .filter(bind => bindings[bind].type !== 'singleton' && bindings[bind].type !== 'factory')
      .map(bind => bindings[bind].value);
  }

  /**
   * Get a list of the singleton class bindings.
   * @return {Array}
   */
  getSingletons() {
    return Object.keys(bindings)
      .filter(bind => bindings[bind].type === 'singleton')
      .map(bind => bindings[bind].value);
  }

  /**
   * Get a list of the factory function bindings.
   * @return {Array}
   */
  getFactories() {
    return Object.keys(bindings)
      .filter(bind => bindings[bind].type === 'factory')
      .map(bind => bindings[bind].value);
  }

  /**
   * Get a list of the resolved singletons.
   * @return {Array}
   */
  getInstances() {
    return instances;
  }

  /**
   * For development, get the raw bindings object.
   * @return {Object}
   */
  getRawBindings() {
    return bindings;
  }

  /**
   * Remove a resolved shared instance from the instance cache.
   * @param {String}  name  Class name string.
   */
  forgetInstance(name) {
    if(this.isShared(name) && instances.hasOwnProperty(name)) {
      delete instances[name];
    }
  }

  /**
   * Clear all of the shared instances from the container.
   */
  forgetAllSharedInstances() {
    instances = {};
  }

  /**
   * Flush the container of all bindings and instances.
   */
  flush() {
    bindings = {};
    instances = {};
  }


  /**
   * Register a binding with the container.
   * @param  {String}  name   Item name string.
   * @param  {Mixed}   value  Value to bind.
   */
  register(name, value) {
    if(this.isBound(name)) {
      throw new Error(`${ name } is already bound.`);
    }

    const binding = new Binding(value);

    bindings[name] = binding;

    return binding;
  }

  /**
   * An alias for register.
   * @param  {String}  name   Item name string.
   * @param  {Mixed}   value  Value to bind.
   */
  bind(name, value) {
    return this.register(name, value);
  }

  /**
   * Re-register a binding with the container.
   * @param  {String}  name   Item name string.
   * @param  {Mixed}   value  Value to bind.
   */
  rebind(name, value) {
    if(this.isBound(name)) {
      if(this.isShared(name)) {
        throw new Error('Can not rebind shared instances');
      }

      delete bindings[name];
    }

    this.bind(name, value);
  }

  /**
   * Resolve the given item from the container.
   * @param  {String}  name  Item name string.
   * @return {Mixed}
   */
  resolve(name) {
    if(this.isBound(name)) {
      if(this.isShared(name)) {
        return getSingleton(name, this);
      }

      if(this.isFactory(name)) {
        return callFactory(name);
      }

      return getClass(name, this);
    }

    try {
      return require(name);
    }
    catch(error) {
      throw new Error(`Unknown binding: ${ name }`);
    }
  }

  /**
   * Alias for resolve.
   * @param  {String}  name  Item name string.
   * @return {Mixed}
   */
  make(name) {
    return this.resolve(name);
  }
}

module.exports = new Container();
