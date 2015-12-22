swby.lang.namespace('swby.gapi');

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
*/
swby.gapi.Request = function() {
  swby.promise.Promise.call(this);
};
swby.lang.inherits(swby.gapi.Request, swby.promise.Promise);

/**
@param {function(Object|boolean, string)} callback
*/
swby.gapi.Request.prototype.execute = function(callback) {
  
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

/**
*/
swby.gapi.client. = function() {
  
};

/**
*/
swby.gapi.client. = function() {
  
};
