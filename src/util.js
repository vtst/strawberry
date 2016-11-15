swby.lang.namespace('swby.util');

/**
@param {Element} element
@param {string} className
@return {Element}
 */
swby.util.getAncestorByClass = function(element, className) {
  while (element) {
    if (element.classList.contains(className)) return element;
    element = element.parentNode;
  }
  return null;
};

/**
@param {Element} element
@param {string} className
*/
swby.util.getElementByClassName = function(element, className) {
  var elements = element.getElementsByClassName(className);
  if (elements.length == 0) return null;
  else return elements[0];
};

/**
@param {Object} obj
@return {Object}
*/
swby.util.clone = function(obj) {
  var clone = {};
  for (var key in obj) clone[key] = obj[key];
  return clone;
};

/**
@param {Element} el
@return {string}
 */
swby.util.getSelectValue = function(el) {
  var selectedIndex = el.selectedIndex;
  return selectedIndex >= 0 ? el.options[selectedIndex].value : null;
};

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
@param {Array.<T1>} arr1
@param {Array.<T2>} arr2
@param {function(T1, T2)} fn
@param {Object=} opt_obj
@template T1, T2
 */
swby.util.forEach2 = function(arr1, arr2, fn, opt_obj) {
  swby.lang.assert(arr1.length == arr2.length);
  for (var i = 0; i < arr1.length; ++i) {
    fn.call(opt_obj, arr1[i], arr2[i], i);
  }
};

/**
@param {Array.<T1>} arr1
@param {Array.<T2>} arr2
@param {Array.<T3>} arr3
@param {function(T1, T2, T3)} fn
@param {Object=} opt_obj
@template T1, T2, T3
 */
swby.util.forEach3 = function(arr1, arr2, arr3, fn, opt_obj) {
  swby.lang.assert(arr1.length == arr2.length);
  swby.lang.assert(arr1.length == arr3.length);
  for (var i = 0; i < arr1.length; ++i) {
    fn.call(opt_obj, arr1[i], arr2[i], arr3[i], i);
  }
};

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

/**
@param {Date} d
@return {Date}
@private
 */
swby.util.getDate_ = function(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
@param {Date} d1
@param {Date} d2
@return {number}
@private
*/
swby.util.numberOfDays_ = function(d1, d2) {
  var d1r = new swby.util.getDate_(d1);
  var d2r = new swby.util.getDate_(d2);
  return Math.round((d2r.getTime() - d1r.getTime()) / (1000 * 3600 * 24));
};

/**
@param {number} x
@return {string}
@private
 */
swby.util.padOnTwoDigits_ = function(x) {
  if (x < 10) return '0' + x;
  else return '' + x;
};

/**
@param {Date} d
@return {string}
@private
 */
swby.util.formatTime_ = function(d) {
  return swby.util.padOnTwoDigits_(d.getHours()) + ':' + swby.util.padOnTwoDigits_(d.getMinutes())
};

/** @const @private {Array.<string>} */
swby.util.DAYS_OF_WEEK_ = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 @param {string} start
 @param {string} end
 */
swby.util.formatEventWhen = function(start, end) {
  var now = new Date();
  var startDate = new Date(start);
  var endDate = new Date(end);
  
  var result = '';
  
  // Start day
  var startDateInDays = swby.util.numberOfDays_(now, startDate);
  if (startDateInDays == 0) {
    result += 'Today';
  } else if (startDateInDays > 0 && startDateInDays < 7) {
    result += swby.util.DAYS_OF_WEEK_[startDate.getDay()];
  } else {
    result += start.substr(0, 10);
  }
  
  result += ', ' + swby.util.formatTime_(startDate) + ' to ' + swby.util.formatTime_(endDate);

  var endDateInDays = swby.util.numberOfDays_(startDate, endDate);
  if (endDateInDays != 0) result += ' (+' + endDateInDays + ')';
  return (result);
};

/**
 @param {string} html
 @return {Element}
*/
swby.util.renderHtmlAsElement = function(html) {
  var element = document.createElement('div');
  element.innerHTML = html;
  return element.firstElementChild;  
};