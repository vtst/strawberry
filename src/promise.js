var swby = swby || {};
swby.promise = {};

// *************************************************************************
// Utility functions

/**
@param {*} obj
@return {boolean}
@private
*/
swby.promise.isArray_ = function(x) {
  return x instanceof Array || typeof x == 'array';
};

/**
@param {*} obj
@return {boolean}
@private
*/
swby.promise.isFunction_ = function(x) {
  return typeof x == 'function';
};

/**
@param {*} obj
@return {Function|null}
@private
*/
swby.promise.ifFunction_ = function(x) {
  if (swby.promise.isFunction_(x)) return x;
  else return null;
};

/**
@param {*} obj
@return {boolean}
@private
*/
swby.promise.isObject_ = function(x) {
  var type = typeof x;
  return (type == 'object' && x != null) || type == 'function';
};

swby.promise.async_ = function(fn, opt_context, opt_arg) {
  setTimeout(fn.bind(opt_context, opt_arg), 0);
};

/**
@enum {number}
@private
 */
swby.promise.State_ = {
  PENDING: 0,
  FULFILLED: 1,
  REJECTED: 2
};

// ****************************************************************************
// Class swby.promise.Promise

/**
@param {function(this:CONTEXT,function(VALUE),function(REASON))=} opt_fn
@param {CONTEXT=} opt_context
@constructor
@template CONTEXT,VALUE,REASON
*/
swby.promise.Promise = function(opt_fn, opt_context) {
  /** @private {swby.promise.State_} */
  this.state_ = swby.promise.State_.PENDING;
  /** @private {Array.<swby.promise.ChildPromise_>} */
  this.children_ = [];
  
  if (opt_fn) {
    try {
      opt_fn.call(opt_context || this,
                  this.fulfill_.bind(this),
                  this.reject_.bind(this));
    } catch (e) {
      this.reject_(e);
    }
  }
};

/**
@param {VALUE} value
@private
*/
swby.promise.Promise.prototype.fulfill_ = function(value) {
  if (this.state_ != swby.promise.State_.PENDING) return;
  this.state_ = swby.promise.State_.FULFILLED;
  /** @private {VALUE} */
  this.value_ = value;
  this.resolveAndClearChildren_();
};

/**
@param {REASON} reason
@private
*/
swby.promise.Promise.prototype.reject_ = function(reason) {
  if (this.state_ != swby.promise.State_.PENDING) return;
  this.state_ = swby.promise.State_.REJECTED;
  /** @private {REASON} */
  this.reason_ = reason;
  this.resolveAndClearChildren_();
};

/**
@param {function(this:THEN_CONTEXT, VALUE)=} opt_onFulfilled
@param {function(this:THEN_CONTEXT, REASON)=} opt_onRejected
@param {THEN_CONTEXT=} opt_context
@return {swby.promise.Promise}
@template THEN_CONTEXT
*/
swby.promise.Promise.prototype.then = function(
  opt_onFulfilled, opt_onRejected, opt_context) {
  // TODO: Filter arguments if they are not functions.
  var childPromise = new swby.promise.ChildPromise_(
    swby.promise.ifFunction_(opt_onFulfilled),
    swby.promise.ifFunction_(opt_onRejected), opt_context);
  if (this.state_ == swby.promise.State_.PENDING)
    this.children_.push(childPromise);
  else
    swby.promise.async_(this.resolveChild_, this, childPromise);
  return childPromise;
};

/**
@param {swby.promise.ChildPromise_} promise
@param {*} x
 */
swby.promise.resolve_ = function(promise, x) {
  if (promise === x) {
    promise.reject_(new TypeError);
  } else if (swby.promise.isObject_(x)) { // FOO
    try {
      var x_then = x.then;
    } catch (e) {
      promise.reject_(e);
      return;
    }
    if (swby.promise.isFunction_(x_then)) {
      var called = false;
      try {
        x_then.call(x, function(y) {
          if (called) return;
          called = true;
          swby.promise.resolve_(promise, y);
        }, function(r) {
          if (called) return;
          called = true;
          promise.reject_(r);
        });
      } catch(e) {
        if (!called) promise.reject_(e);
      }
    } else {
      promise.fulfill_(x);
    }
  } else {
    promise.fulfill_(x);
  }
};

/**
@param {swby.promise.ChildPromise_} child
@private
 */
swby.promise.Promise.prototype.resolveChild_ = function(child) {  
  if (this.state_ == swby.promise.State_.FULFILLED) {
    if (child.onFulfilled_) {
      try {
        var x = child.onFulfilled_.call(child.context_, this.value_);
      } catch (e) {
        child.reject_(e);
        return;
      }
      swby.promise.resolve_(child, x);
    } else {
      child.fulfill_(this.value_);
    }
  } else {
    swby.lang.assert(this.state_ == swby.promise.State_.REJECTED);
    if (child.onRejected_) {
      try {
        var x = child.onRejected_.call(child.context_, this.reason_);
      } catch (e) {
        child.reject_(e);
        return;
      }
      swby.promise.resolve_(child, x);
    } else {
      child.reject_(this.reason_);
    }
  }
};

/**
@private
*/
swby.promise.Promise.prototype.resolveAndClearChildren_ = function() {
  var children = this.children_;
  this.children_ = [];
  swby.promise.async_(function() {
    for (var i = 0; i < children.length; ++i) {
      this.resolveChild_(children[i]);
    }
  }, this);
};

// ****************************************************************************
// Class swby.promise.ChildPromise_

/**
@param {function(this:THEN_CONTEXT, VALUE)=} opt_onFulfilled
@param {function(this:THEN_CONTEXT, REASON)=} opt_onRejected
@param {THEN_CONTEXT=} opt_context
@template THEN_CONTEXT
@private
*/
swby.promise.ChildPromise_ = function(opt_onFulfilled, opt_onRejected, opt_context) {
  swby.promise.Promise.call(this);
  this.onFulfilled_ = opt_onFulfilled;
  this.onRejected_ = opt_onRejected;
  this.context_ = opt_context;
};
swby.lang.inherits(swby.promise.ChildPromise_, swby.promise.Promise);

// ****************************************************************************

/**
@param {Array.<T>|Object.<string, T>} obj
@param {function(this:CONTEXT, T, (number|string)} fn
@param {CONTEXT=} opt_context
@template CONTEXT, T
 */
swby.promise.forEach_ = function(obj, fn, opt_context) {
  if (swby.promise.isArray_(obj)) {
    obj.forEach(fn, opt_context);
  } else {
    for (var key in obj) {
      fn.call(opt_context, obj[key], key);
    }
  }
};

/**
@param {Array.<*>|Object.<string, *>} obj
@return {number}
 */
swby.promise.getSize_ = function(obj) {
  if (swby.promise.isArray_(obj)) {
    return obj.length;
  } else {
    var length = 0;
    for (var key in obj) ++length;
    return length;
  }
};

/**
@param {Object.<string, swby.promise.Promise>|Array.<swby.promise.Promise>} promises
@return {swby.promise.Promise}
*/
swby.promise.all = function(promises) {
  var count = 1;
  var compoundValue = swby.promise.isArray_(promises) ? [] : {};
  var failed = false;
  return new swby.promise.Promise(function(fulfill, reject) {
    function finalize() {
      --count;
      if (count == 0) fulfill(compoundValue);
    }
    swby.promise.forEach_(promises, function(child, key) {
      ++count;
      child.then(function(value) {
        if (failed) return;
        compoundValue[key] = value;
        finalize();
      }, function(reason) {
        if (failed) return;
        failed = true;
        reject(reason);
      });
    });
    finalize();
  });
};

/**
@param {Object.<string, swby.promise.Promise>|Array.<swby.promise.Promise>} promises
@return {swby.promise.Promise}
*/
swby.promise.any = function(promises) {
  var count = 1;
  var compoundReason = swby.promise.isArray_(promises) ? [] : {};
  var fulfilled = false;
  return new swby.promise.Promise(function(fulfill, reject) {
    function finalize() {
      --count;
      if (count == 0) reject(compoundReason);
    }
    swby.promise.forEach_(promises, function(child, key) {
      ++count;
      child.then(function(value) {
        if (fulfilled) return;
        fulfilled = true;
        fulfill(value);
      }, function(reason) {
        if (fulfilled) return;
        compoundReason[key] = reason;
        finalize();
      });
    });
    finalize();
  });
};

/**
@param {*} value
@return {swby.promise.Promise}
 */
swby.promise.fulfilled = function(value) {
  return new swby.promise.Promise(function(fulfill, reject) {
    fulfill(value);
  });
};

/**
@param {*} reason
@return {swby.promise.Promise}
 */
swby.promise.rejected = function(reason) {
  return new swby.promise.Promise(function(fulfill, reject) {
    reject(reason);
  });
};

/**
@param {function(this:CONTEXT,function(VALUE),function(REASON))=} opt_fn
@param {CONTEXT=} opt_context
@return {swby.promise.Promise}
@template CONTEXT,VALUE,REASON
*/
swby.promise.create = function(opt_fn, opt_context) {
  return new swby.promise.Promise(opt_fn, opt_context);
};

// *************************************************************************
// Class swby.promise.AbortablePromise

/**
@param {function(this:CONTEXT,function(VALUE),function(REASON))=} opt_fn
@param {function(this:CONTEXT)} opt_abort
@param {CONTEXT=} opt_context
@constructor
@extends swby.promise.Promise
@template CONTEXT,VALUE,REASON
*/
swby.promise.AbortablePromise = function(opt_fn, opt_abort, opt_context) {
  /** @private {function(this:CONTEXT)} */
  this.abort_ = opt_abort;
  /** @private {CONTEXT=} */
  this.context_ = opt_context || this;
  swby.promise.Promise.call(this, opt_fn, opt_context);
};
swby.lang.inherits(swby.promise.AbortablePromise, swby.promise.Promise);

/**
 */
swby.promise.AbortablePromise.prototype.abort = function() {
  if (this.abort_) this.abort_.call(this.context_);
};

// *************************************************************************
// Class swby.promise.Timeout_

/**
@param {swby.promise.Promise} promise
@param {number} delay  (in milliseconds)
@constructor
@extends {swby.promise.Promise}
@private
*/
swby.promise.Timeout_ = function(promise, delay) {
  /** @private {swby.promise.Promise} */
  this.promise_ = promise;
  swby.promise.Promise.call(this, function(fulfill, reject) {
    this.reject_ = reject;
    this.timeout_ = setTimeout(this.onTimeout_.bind(this), delay);
    promise.then(function(value) {
      if (!this.clearTimeout_()) return;
      fulfill(value);
    }, function(reason) {
      if (!this.clearTimeout_()) return;
      reject(reason);
    }, this)
  }, this);
};
swby.lang.inherits(swby.promise.Timeout_, swby.promise.Promise);

/**
@private
 */
swby.promise.Timeout_.onTimeout_ = function() {
  if (!this.clearTimeout_()) return;
  if (this.promise_.abort) this.promise_.abort();
  this.reject_('timeout');
};

/**
 @return {boolean}
 @private
 */
swby.promise.Timeout_.clearTimeout_ = function() {
  if (!this.timeout_) return false;
  clearTimeout(this.timeout_);
  this.timeout_ = null;
  return true;
};

/**
 @param {swby.promise.Promise} promise
 @param {number} delay  (in milliseconds)
 */
swby.promise.timeout = function(promise, delay) {
  return new swby.promise.Timeout_(promise, delay);
};

/**
 @param {number} time_ms
 @return {swby.promise.AbortablePromise}
 */
swby.promise.delay = function(time_ms) {
  return new swby.promise.AbortablePromise(function(fulfill, reject) {
    var zhis = this;
    this.delay_ = setTimeout(function() {
      zhis.delay_ = null;
      fulfill(null);
    }, time_ms); 
  }, function() {
    if (this.delay_) clearTimeout(this.delay_);
  }, this);
}

/**
@param {Element} target
@param {string} eventType
@return {swby.promise.AbortablePromise}
*/
swby.promise.onDomEvent = function(target, eventType) {
  return new swby.promise.AbortablePromise(function(fulfill, reject) {
    var zhis = this;
    zhis.eventHandler_ = function(event) {
      target.removeEventListener(eventType, zhis.eventHandler_);
      fulfill(event);
    };
    target.addEventListener(eventType, this.eventHandler_, false);
  }, function() {
    target.removeEventListener(eventType, this.eventHandler_);
  }, this);
};
