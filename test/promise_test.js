// To run this test:
//   npm install -g promises-aplus-tests
//   promises-aplus-tests promise_test.js

var fs = require('fs');
var vm = require('vm');

function include(path) {
  var code = fs.readFileSync(path, 'utf-8');
  vm.runInThisContext(code, path);
};

include('../src/lang.js');
include('../src/promise.js');

module.exports = {};

module.exports.functor = function(Cls) {
  return {
    resolved: function(value) {
      return new swby.promise.Promise(function(fulfill, reject) {
        fulfill(value);
      });
    },
    rejected: function(reason) {
      return new swby.promise.Promise(function(fulfill, reject) {
        reject(reason);
      });  
    },
    deferred: function() {
      var object = {
        values: [],
        reasons: [],
        resolve: function(value) {
          if (this.fulfill_) {
            this.fulfill_(value);
          } else {
            this.values.push(value);
          }
        },
        reject: function(reason) {
          if (this.reject_) {
            this.reject_(reason);
          } else {
            this.reasons.push(reason);
          }
        }
      };
      object.promise = new Cls(function(fulfill, reject) {
        if (object.run_) throw 'Multile calls.';
        object.run_ = true;
        object.fulfill_ = fulfill;
        object.reject_ = reject;
        object.values.forEach(fulfill);
        object.reasons.forEach(reject);
      });
      return object;
    }
  }
};
