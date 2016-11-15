swby.lang.namespace('swby.gapi');

// ****************************************************************************
// Configuration

/**
@typedef {{
    name: string,
    version: string,
    root: (string|undefined)
  }}
*/
swby.gapi.Api;

/**
@typedef {{
    version: string
    apiKey: string,
    authDomain: string,
    databaseURL: string,
    storageBucket: string,
    messagingSenderId: string
  }}
*/
swby.gapi.FirebaseConfig;

/**
@typedef {{
    apiKey: string,
    discoveryDocs: Array.<string>,
    clientId: string,
    scopes: Array.<string>,
    apis: Array.<swby.gapi.Api>,
    firebase: swby.gapi.FirebaseConfig     
  }}
*/
swby.gapi.Config;

// ****************************************************************************
// Class swby.gapi.Timeout_

/**
A timeout to run in parallel with callbacks.
@constructor
@private
*/
swby.gapi.Timeout_ = function(delayMs, reject, opt_rejectArg) {
  if (delayMs) {
    this.timeout_ = window.setTimeout(this.onTimeout_.bind(this), delayMs);
  }
  /** @private {boolean} */
  this.expired_ = false;
  /** @private {function(E)} */
  this.reject_ = reject;
  /** @private {E} */
  this.rejectArg_ = opt_rejectArg || 'timeout';
};

/**
@private
*/
swby.gapi.Timeout_.prototype.onTimeout_ = function() {
  this.expired_ = true;
  delete this.timeout_;
  this.reject_(this.rejectArg_);
};

/**
@return {boolean}
@public
*/
swby.gapi.Timeout_.prototype.hasExpired = function() {
  if (this.timeout_) window.clearTimeout(this.timeout_);
  return this.expired_;
};

// ****************************************************************************
// Utility function to create promises from functions with callbacks

/**
Create a new promise that calls fn with the name of a top-level callback.
The promise is resolved when the top-level callback is called.
The promise is rejected if this does not happen before opt_timeoutMs.
@param {function(string)} fn
@param {number=} opt_timeoutMs
@param {E=} opt_error
@param {string=} opt_callbackName
@return {swby.promise.Promise<V, E>}
@template V, E
*/
swby.gapi.callFunctionWithToplevelCallback_ = function(fn, opt_timeoutMs, opt_error, opt_callbackName) {
  var callbackName = opt_callbackName || ('swby_' + Math.random()).replace('.', '');
  return new swby.promise.Promise(function(resolve, reject) {
    var timeout = new swby.gapi.Timeout_(opt_timeoutMs, reject, opt_error);
    window[callbackName] = function() {
      delete window[callbackName];
      if (timeout.hasExpired()) return;
      resolve();
    };
    fn(callbackName);
  });
};

/**
Create a new promise that calls fn with a callback resolving the promise.
The promise is rejected if fn takes more than opt_timeoutMs to run.
@param {function(function(V))} fn
@param {number=} opt_timeoutMs
@param {E=} opt_error
@return {swby.promise.Promise<V, E>}
*/
swby.gapi.callFunctionWithCallback_ = function(fn, opt_timeoutMs, opt_error) {
  return new swby.promise.Promise(function(resolve, reject) {
    var timeout = new swby.gapi.Timeout_(opt_timeoutMs, reject, opt_error);
    fn(function(arg) {
      if (timeout.hasExpired()) return;
      resolve(arg);
    });
  });
};

/**
@param {string} src
@param {number=} opt_timeoutMs
@param {ERROR=} opt_error
@return {swby.promise.Promise<Void, ERROR>}
@template ERROR
@private
*/
swby.gapi.loadJavaScript_ = function(src, opt_timeoutMs, opt_error) {
  var script = document.createElement('script');
  script.type = 'application/javascript';
  script.src = src;
  return new swby.promise.Promise(function(resolve, reject) {
    var timeout = new swby.gapi.Timeout_(opt_timeoutMs, function(error) {
      document.body.removeChild(script);
      reject(error);
    }, opt_error);
    document.body.appendChild(script);
    script.addEventListener('load', function() {
      if (timeout.hasExpired()) return;
      document.body.removeChild(script);
      resolve();
    });    
  });
};

// ****************************************************************************
// Class swby.gapi.Init_

/**
@private @const {number}
*/
swby.gapi.RELOAD_BEFORE_EXPIRES_SECS_ = 300;  // 5 minutes

/**
@private @const {number}
*/
swby.gapi.TIMEOUT_MS_ = 5000;

/**
@private @const {string}
*/
swby.gapi.GAPI_JS_URL_ = 'https://apis.google.com/js/api.js';

/**
@private @const {string}
*/
swby.gapi.FIREBASE_URL_ = 'https://www.gstatic.com/firebasejs/<version>/firebase.js';

/**
@private @const {string}
*/
swby.gapi.CONFIRM_MESSAGE_ =
  'This application requires authorization to access some Google' +
  'APIs. Please click on "Proceed" to run through the ' +
  'authorization process. This will open a popup window from ' +
  'Google where you will be to review the access rights and ' +
  'approve them.';

/**
@return {function(): swby.promise.Promise}
@private
*/
swby.gapi.DEFAULT_CONFIRM_ = function() {
  var button = document.createElement('button');
  button.textContent = 'Proceed';
  var dialog = swby.util.createDom(
      'div',
      {style: 'position: fixed; top: 0; left: 0; z-index: 1000; width: 100%; height: 100%; ' +
        'background-color: rgba(96, 96, 96, .5); display: flex; align-items: center; justify-content: center;'}, [
      swby.util.createDom(
          'div',
          {style: 'background-color: white; padding: 10px; max-width: 400px;'}, [
        swby.util.createDom('div', {style: 'margin-bottom: 10px;'}, swby.gapi.CONFIRM_MESSAGE_),
        button
      ])                                                                                                                  
  ]);
  document.body.appendChild(dialog);
  return new swby.promise.Promise(function(resolve, reject) {
    button.addEventListener('click', function() {
      if (!dialog) return;
      document.body.removeChild(dialog);
      dialog = null;
      resolve();
    });
  });
};

/**
@param {swby.gapi.Config}
@param {function(): swby.promise.Promise} opt_confirm
@constructor
@private
 */
swby.gapi.Init_ = function(config, opt_confirm) {
  /** @private {swby.gapi.Config} */
  this.config_ = config;
  /** @private {boolean} */
  this.requiresAuth_ = config.clientId && (config.scopes && config.scopes.length > 0);
  /** @private {function(): swby.promise.Promise} */
  this.confirm_ = opt_confirm || swby.gapi.DEFAULT_CONFIRM_;
};

/**
Load the main library (api.js).
@return {swby.promise.Promise}
*/
swby.gapi.Init_.prototype.loadApiJs_ = function() {
  return swby.gapi.callFunctionWithToplevelCallback_(
      function(callbackName) {
        swby.gapi.loadJavaScript_(swby.gapi.GAPI_JS_URL_ + '?onload=' + callbackName)
      },
      swby.gapi.TIMEOUT_MS_,
      'Timeout while loading api.js');
};

/**
Load the client library.
@return {swby.promise.Promise}
*/
swby.gapi.Init_.prototype.loadClient_ = function() {
  return swby.gapi.callFunctionWithCallback_(
      gapi.load.bind(null, this.requiresAuth_ ? 'client:auth2' : 'client'),
      swby.gapi.TIMEOUT_MS_,
      'Timeout while loading Google API client library');
};

/**
Authenticate.
@return {swby.promise.Promise<AuthResponse>}
*/
swby.gapi.Init_.prototype.authenticate_ = function() {
  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    var currentUser = gapi.auth2.getAuthInstance().currentUser.get();
    var authResponse = currentUser.getAuthResponse();
    if (authResponse.expires_in < swby.gapi.RELOAD_BEFORE_EXPIRES_SECS_) {
      // If the token expires soon, refresh it now.
      var auth = currentUser.reloadAuthResponse();
    } else {
      // The token does not expire soon, do nothing.
      var auth = swby.promise.fulfilled(authResponse);
    }
  } else {
    // Sign in with user consent.
    var auth = this.confirm_().then(function() {
      return gapi.auth2.getAuthInstance().signIn().then(function(resp) {
        return gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse();
      });
    });
  }
  // Perform authentication, and setup the periodic reload of the auth response.
  return auth.then(this.setupReloadAuthResponse_);
};

/**
@param {AuthResponse} authResponse
*/
swby.gapi.Init_.prototype.setupReloadAuthResponse_ = function(authResponse) {
  var zhis = this;
  // TODO: To be tested.
  window.setTimeout(function() {
    gapi.auth2.getAuthInstance().currentUser.get().reloadAuthResponse().then(
        zhis.setupReloadAuthResponse_);
  }, (authResponse.expires_in - swby.gapi.RELOAD_BEFORE_EXPIRES_SECS_) * 1000);
};

/**
Load APIs in parallel.
@return {swby.promise.Promise}
*/
swby.gapi.Init_.prototype.loadApis_ = function() {
  return swby.promise.all(swby.util.map(this.config_.apis || [], function(api) {
    var root = api.root;
    if (root && root.charAt(0) == '/' && root.charAt(1) != '/') root = '//' + window.location.host + root;
    return gapi.client.load(api.name, api.version, null, root).then(function(resp) {
      if (resp && resp.error) {
        throw 'Cannot load API "' + api.name + '" (' + api.version + ')';
      }
    });      
  }));
};

/**
Load the Firebase library.
@return {swby.promise.Promise}
*/
swby.gapi.Init_.prototype.loadFirebase_ = function() {
  if (!this.config_.firebase) return swby.promise.fulfilled();
  return swby.gapi.loadJavaScript_(
      swby.gapi.FIREBASE_URL_.replace('<version>', this.config_.firebase.version),
      swby.gapi.TIMEOUT_MS_,
      'Timeout while loading Firebase');
};

/**
Initialize Firebase.
@return {swby.promise.Promise}
 */
swby.gapi.Init_.prototype.initFirebase_ = function() {
  if (!this.config_.firebase) return swby.promise.fulfilled();
  firebase.initializeApp({
    apiKey: this.config_.firebase.apiKey,
    authDomain: this.config_.firebase.authDomain,
    databaseURL: this.config_.firebase.databaseURL,
    storageBucket: this.config_.firebase.storageBucket,
    messagingSenderId: this.config_.firebase.messagingSenderId
  });
  if (this.requiresAuth_) {
    var id_token =
      gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
    var credential = firebase.auth.GoogleAuthProvider.credential(id_token);
    return firebase.auth().signInWithCredential(credential);
  } else {
    return swby.promise.fulfilled();
  }
};

/**
@public
*/
swby.gapi.Init_.prototype.run = function() {
  var zhis = this;
  return zhis.loadApiJs_().then(function() {
    // Load the client library.
    return zhis.loadClient_();
  }).then(function() {
    // Initialize the client library.
    return gapi.client.init({
      apiKey: zhis.config_.apiKey,
      discoveryDocs: zhis.config_.discoveryDocs,
      clientId: zhis.config_.clientId,
      scope: zhis.config_.scopes.join(' ')
    });
  }).then(function() {
    // In parallel: authenticates and load APIs.
    return swby.promise.all([
      zhis.requiresAuth_ ? zhis.authenticate_() : swby.promise.fulfilled(),
      zhis.loadApis_(),
      // Loading Firebase could be done in parallel with the gapi.client.init,
      // but it does not seem to be on the critical path. (TODO)
      zhis.loadFirebase_()
    ]);
  }).then(function() {
    // Initialize Firebase.
    return zhis.initFirebase_();
  });
};

/**
@param {swby.gapi.Config}
@return {swby.promise.Promise}
*/
swby.gapi.init = function(config) {
  return (new swby.gapi.Init_(config)).run(); 
};
