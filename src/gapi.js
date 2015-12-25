swby.lang.namespace('swby.gapi');


/**
@param {string} path
@param {Object.<string, string>} params
@return {string}
*/
swby.gapi.buildUrl_ = function(path, params) {
  var url = path;
  if (params) {
    var q = '';
    for (var key in params) {
      q += (q ? '&' : '?') + encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }
    url += q;
  }
  return url;
};

// *************************************************************************
// Class swby.gapi.Token

/**
@constructor
*/
swby.gapi.Token = function() {};

/** @public {string} */
swby.gapi.Token.prototype.access_token;

/** @public {string} */
swby.gapi.Token.prototype.error;

/** @public {string} */
swby.gapi.Token.prototype.expires_in;

/** @public {string} */
swby.gapi.Token.prototype.state;

// *************************************************************************
// Class swby.gapi.Request

/**
@constructor
@extends {swby.promise.Promise}
@template VALUE, REASON
*/
swby.gapi.Request = function() {
  swby.promise.LazyPromise.call(this, this.execute_, this);
};
swby.lang.inherits(swby.gapi.Request, swby.promise.LazyPromise);

/**
@param {function(VALUE)} fulfill
@param {function(REASON)} reject
@protected @abstract
*/
swby.gapi.Request.prototype.execute_ = function(fulfill, reject) {};

/**
@param {function(Object|boolean, string)} callback
*/
swby.gapi.Request.prototype.execute = function(callback) {
  // TODO: Check how it should behave in case of error.
  this.execute_(callback, callback);
};

// *************************************************************************
// Class swby.gapi.XhrRequest

/**
typedef {{path:string,
          method: (string|undefined),
          params: Object.<string, string>,
          headers: Object.<string, string>,
          body: (string|Object)}} args
 */
swby.gapi.XhrRequestArgs;

/**
@constructor
@extends {swby.gapi.Request}
@param {swby.gapi.XhrRequestArgs}
@template VALUE, REASON
*/
swby.gapi.XhrRequest = function(args) {
  swby.gapi.Request.call(this);
  /** @private {swby.gapi.XhrRequestArgs} */
  this.args_ = args;
};
swby.lang.inherits(swby.gapi.XhrRequest, swby.gapi.Request);

/**
@param {function(VALUE)} fulfill
@param {function(REASON)} reject
@protected
*/
swby.gapi.XhrRequest.prototype.execute_ = function(fulfill, reject) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      // TODO: Handle error while parsing JSON.
      // TODO: Check how it should behave in case of error.
      if (xhr.status == 200) fulfill(JSON.parse(xhr.responseText));
      else reject({error: 'Error'});
    }
  }
  var url = swby.gapi.buildUrl_(args.path, args.params);
  xhr.open(this.args_.method || 'GET', url);
  if (this.args_.headers) {
    for (var name in this.args_.headers) {
      xhr.setRequestHeader(name, this.args_.headers[name]);
    }
  }
  xhr.send(this.args_.body || null);  
};

// *************************************************************************
// Class swby.gapi.RpcRequest

/**
@constructor
@extends {swby.promise.Promise}
*/
swby.gapi.RpcRequest = function() {
  swby.gapi.Request.call(this);
};
swby.lang.inherits(swby.gapi.RpcRequest, swby.gapi.Request);

// *************************************************************************
// Class swby.gapi.Batch

/**
@constructor
@extends {swby.promise.Promise}
*/
swby.gapi.Batch = function() {
  swby.promise.Promise.call(this);
};
swby.lang.inherits(swby.gapi.Batch, swby.promise.Promise);

/**
@param {swby.gapi.Request} request
@param {{id: string,
         callback: function(Object, Object.<string, string>)}=} opt_params
*/
swby.gapi.Batch.prototype.add = function(request, opt_params) {

};

/**
@param {function(Object.<string, Object|boolean>, Object.<string, string>)} callback
*/
swby.gapi.Batch.prototype.execute = function(callback) {

};

// *************************************************************************
// swby.gapi.auth

swby.lang.namespace('swby.gapi.auth');

// TODO: Define Token type.
/**
@param {{client_id: (string|undefined),
         immediate: (boolean|undefined),
         response_type: (string|undefined),
         scope: (string|Array.<string>)}} params
@param {function(swby.gapi.Token)} callback
*/
swby.gapi.auth.authorize = function(params, callback) {
  
};

/**
@param {function()} callback
*/
swby.gapi.auth.init = function(callback) {
  
};

/**
@return {swby.gapi.Token}
*/
swby.gapi.auth.getToken = function() {
  
};

/**
@param {swby.gapi.Token} token
*/
swby.gapi.auth.setToken = function(token) {
  
};

// *************************************************************************
// swby.gapi.client

swby.lang.namespace('swby.gapi.client');

/**
@param {string} name
@param {string} version
@param {function()=} callback
@return {swby.promise.Promise}
*/
swby.gapi.client.load = function(name, version, callback) {
  
};

/**
@param {{path:string,
         method: (string|undefined),
         params: Object.<string, string>,
         headers: Object.<string, string>,
         body: (string|Object)}} args
@return {swby.gapi.client.Request}
*/
swby.gapi.client.request = function(args) {
  return new swby.gapi.XhrRequest(args);
};

/**
@param {{path:string,
         method: (string|undefined),
         params: Object.<string, string>,
         headers: Object.<string, string>,
         body: (string|Object)}} args
@return {swby.gapi.client.Batch}
*/
swby.gapi.client.newBatch = function(args) {
  
};

/**
@param {string} apiKey
*/
swby.gapi.client.setApiKey = function(apiKey) {
  
};
