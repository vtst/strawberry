var swby = swby || {};
swby.lang = {};

var swby_global = this;

swby.lang.namespace = function(namespace) {
  var fragments = namespace.split('.');
  swby.lang.assert(fragments.length > 0);
  var obj = swby_global;
  for (var i = 0; i < fragments.length; ++i) {
    var nextObj = obj[fragments[i]];
    if (!nextObj) {
      nextObj = {};
      obj[fragments[i]] = nextObj;
    }
    obj = nextObj;
  }
};

/**
 @param {boolean} statement
 @param {string=} opt_message
 */
swby.lang.assert = function(statement, opt_message) {
  if (!statement) throw new Error(opt_message || 'Assertion error');
};

/**
 @param {Function} childCtor
 @param {Function} parentCtor
 */
swby.lang.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {}
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  childCtor.prototype.constructor = childCtor;
};

/**
 */
swby.lang.abstractMethod = function() {
  throw new Error('Abstract method not implemented');
};

/**
 */
swby.lang.notImplementedMethod = function() {
  throw new Error('Method not implemented');
};

/**
 @param {Function} ctor
 */
swby.lang.singleton = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    return ctor.instance_ = new ctor;
  };
};

/**
 @param {Array.<string>} arr
 @return {Object.<string, string>}
 */
swby.lang.makeEnum = function(arr) {
  var result = {};
  arr.forEach(function(entry) {
    result[entry] = entry;
  });
  return result;
};