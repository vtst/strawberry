// To run this test:
//   npm install -g promises-aplus-tests
//   promises-aplus-tests promise_lazy_test.js

var base = require('./promise_test.js');

module.exports = base.functor(swby.promise.Promise);