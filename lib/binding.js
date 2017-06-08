'use strict';

/**
 * Determine if the given value is a ES6 class.
 * @private
 * @param  {Mixed}   val  The value to check.
 * @return {Boolean}
 */
function isClass(val) {
  return typeof val === 'function' && /^\s*class\s+/.test(val.toString());
}

/**
 * The Binding class
 */
module.exports = class Binding {
  /**
   * Initializes a new instance of the Binding class.
   * @param  {Mixed}  value  The value to bind.
   */
  constructor(value) {
    if(!value) {
      throw new Error('No value provided.');
    }

    this.value = value;
    this.dependencies = [];

    if(isClass(value)) {
      this.type = 'class';
    }
    else {
      this.type = 'factory';
    }
  }

  /**
   * Mark the binding as a singleton.
   * @return {Binding}
   */
  singleton() {
    this.type = 'singleton';
    return this;
  }

  /**
   * Set the dependencies for the binding.
   * @return {Binding}
   */
  depends() {
    if(!arguments.length) {
      throw new Error('No dependencies given.');
    }

    // I would slice but Node engine (V8) can't optimize that
    // so Array constructor it is
    const args = Array.apply(null, arguments);

    this.dependencies = args;
    return this;
  }

  /**
   * Set the type of the binding.
   * @param  {String}  type  The type to mark the binding as.
   * @return {Binding}
   */
  as(type) {
    if(type !== 'class' && type !== 'factory' && type !== 'singleton') {
      throw new Error('Unknown type.');
    }

    this.type = type;
    return this;
  }
};
