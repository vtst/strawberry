var fs = require('fs');
var vm = require('vm');

function include(path) {
  var code = fs.readFileSync(path, 'utf-8');
  vm.runInThisContext(code, path);
};

include('lang.js');
include('promise.js');

module.exports = {
  resolved: function(value) {
    return new app.promise.Promise(function(fulfill, reject) {
      fulfill(value);
    });
  },
  rejected: function(reason) {
    return new app.promise.Promise(function(fulfill, reject) {
      reject(reason);
    });  
  },
  deferred: function() {
    var object = {};
    object.promise = new app.promise.Promise(function(fulfill, reject) {
      object.resolve = fulfill;
      object.reject = reject;
    });
    return object;
  }
};

var deferred  = module.exports.deferred;

function main() {
  var promise1 = new app.promise.Promise(function(fulfill, reject) {
    setTimeout(function() { fulfill(1); }, 10);
  });
  var promise2 = new app.promise.Promise(function(fulfill, reject) {
    setTimeout(function() { fulfill(2); }, 10);
  });
  app.promise.all({a: promise1, b: promise2}).then(function(value) {
    console.log(value);
  }, function(reason) {
    console.log(reason);
  });
};

main();