swby.lang.namespace('swby.util');

/**
@param {Array.<T>} arr
@param {function(T): U} fn
@return {Array.<U>}
@param {Object=} opt_obj
@template T, U
*/
swby.util.map = function(arr, fn, opt_obj) {
  var result = [];
  arr.forEach(function(elt) {
    result.push(fn.call(opt_obj, elt));
  });
  return result;
}

/**
@param {Element} element
@param {Object.<string, *>|string} attributes
@param {Array.<Element>|string=} children
*/
swby.util.createDom = function(tagName, attributes, children) {
  var element = document.createElement(tagName);
  if (attributes) {
    if (typeof attributes == 'string') {
      element.className = attributes;
    } else {
      for (var key in attributes) {
        if (key == 'className') element.className = attributes[key];
        else element.setAttribute(key, attributes[key]);
      }
    }
  }
  if (children) {
    if (typeof children == 'string') {
      element.textContent = children;
    } else {
      children.forEach(function(child) {
        if (child) element.appendChild(child);
      });
    }
  }
  return element;
};
