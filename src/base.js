swby.lang.namespace('swby.base');

// *************************************************************************
// Class swby.base.Disposable

/**
@constructor
 */
swby.base.Disposable = function() {
  /** @private {Array.<swby.base.Disposable>} */
  this.disposables_ = [];
  /** @private {boolean} */
  this.disposed_ = false;  
};

/**
*/
swby.base.Disposable.prototype.dispose = function() {
  if (this.isDisposed()) return;
  this.disposables_.forEach(function(obj) {
   obj.dispose();
  }, this);
  this.disposeInternal_();
  this.disposed_ = true;
};

/**
@return {boolean}
*/
swby.base.Disposable.prototype.isDisposed = function() {
  return this.disposed_;
};

/**
@protected
*/
swby.base.Disposable.prototype.disposeInternal_ = function() {};

/**
@param {swby.base.Disposable} obj
@return {swby.base.Disposable}
*/
swby.base.Disposable.prototype.registerDisposable = function(obj) {
  this.disposables_.push(obj);
  return obj;
};

// *************************************************************************
// Class swby.base.EventHandler

/**
@param {Object=} opt_this
@constructor
@extends {swby.base.Disposable}
*/
swby.base.EventHandler = function(opt_this) {
  swby.base.Disposable.call(this);
  /** @private{Object} */
  this.this_ = opt_this || this;
  /** @private {Array.<{target: Object, eventType: string,
                        handler: function(Event),
                        useCapture: boolean}>} */
  this.handlers_ = [];
};
swby.lang.inherits(swby.base.EventHandler, swby.base.Disposable);

/**
*/
swby.base.EventHandler.prototype.dispose = function() {
  this.handlers_.forEach(function(entry) {
   entry.target.removeEventListener(entry.eventType,
                                    entry.handler,
                                    entry.useCapture);
  }, this);
  swby.base.EventHandler.prototype.dispose.call(this);
};

/**
@param {Object} target
@param {Array.<string>|string} eventTypes
@param {function(Event)} handler
@param {boolean=} opt_useCapture
*/
swby.base.EventHandler.prototype.listen = function(target, eventTypes, handler, opt_useCapture) {
  var handler_binded = handler.bind(this.this_);
  if (typeof eventTypes == 'string') eventTypes = [eventTypes];
  var useCapture = opt_useCapture || false;
  eventTypes.forEach(function(eventType) {
    target.addEventListener(eventType, handler_binded, useCapture);
    this.handlers_.push({target: target,
                         eventType: eventType,
                         handler: handler_binded,
                         useCapture: useCapture});
  }, this);
};


// ****************************************************************************
// Class swby.base.ErrorReporter

/** @private {string} */
swby.base.ERROR_DIALOG_HTML_ = '\
  <div class="modal fade" id="my-modal">\
    <div class="modal-dialog">\
      <div class="modal-content">\
        <div class="modal-header">\
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\
          <h4 class="modal-title text-danger lead">Oops! Something went wrong</h4>\
        </div>\
        <div class="modal-body">\
          <div class="error-reporter-message lead"></div>\
          <div class="error-reporter-details" style="white-space: pre-wrap;"></div>\
        </div>\
        <div class="modal-footer">\
          <button type="button" class="btn btn-danger" data-dismiss="modal">Continue</button>\
        </div>\
      </div>\
    </div>\
  </div>';

// TODO: Max height
/**
@param {string} message
@param {string|Object} details
@param {boolean=} opt_fatal
 */
swby.base.showErrorDialog = function(message, details, opt_fatal) {
  function setTextContent(element, textContent) {
    if (textContent) element.textContent = textContent;
    else element.style.display = 'none';
  }
  function formatDetails(status, statusText) {
    return 'Error ' + status + (statusText ? ': ' + statusText : '');
  }
  
  var dialog = swby.util.renderHtmlAsElement(swby.base.ERROR_DIALOG_HTML_);
  document.body.appendChild(dialog);
  setTextContent(swby.util.getElementByClassName(dialog, 'error-reporter-message'), message);
  if (typeof(details) == 'object') {
    if (details.error && details.error.code) details = formatDetails(details.error.code, details.error.message);
    else if (details.result && details.result.error && details.result.error.code)
      details = formatDetails(details.result.error.code, details.result.error.message || details.statusText);
    else if (details.status && details.statusText) details = formatDetails(details.status, details.statusText);
    else details = null;
  }
  setTextContent(swby.util.getElementByClassName(dialog, 'error-reporter-details'), details);
  if (opt_fatal) {
    swby.util.getElementByClassName(dialog, 'modal-footer').style.display = 'none';
    swby.util.getElementByClassName(dialog, 'close').style.display = 'none';
  }
  $(dialog).modal('show');
  $(dialog).on('hidden.bs.modal', function(event) {
    document.body.removeChild(dialog);
  });
};

/**
@param {string} message
@param {boolean} fatal
@param {string|Object} details
@private
 */
swby.base.reportApiError_ = function(message, fatal, details) {
  swby.base.showErrorDialog(message, details, fatal);
};

/**
@param {string=} opt_message
@param {boolean=} opt_fatal
 */
swby.base.apiErrorHandler = function(opt_message, opt_fatal) {
  return swby.base.reportApiError_.bind(null, opt_message || 'An API call failed', opt_fatal || false);
};

// ****************************************************************************
// Class swby.base.Page

/**
@constructor
@extends {swby.base.EventHandler}
 */
swby.base.Page = function() {
  swby.base.EventHandler.call(this);
  /** @public {Object.<string, string>} */
  this.queryParameters = this.parseQueryString_(document.location.search);
};
swby.lang.inherits(swby.base.Page, swby.base.EventHandler);

/**
 */
swby.base.Page.prototype.init = function() {
  this.loaded();
};

/**
 */
swby.base.Page.prototype.loaded = function() {
  document.body.classList.remove('loading');
};

/**
@param {string} query
@return {Object.<string, string>}
@private
*/
swby.base.Page.prototype.parseQueryString_ = function(query) {
  var result = {};
  decodeURIComponent(query).substr(1).split('&').forEach(function(s) {
    var arr = s.split('=', 2);
    result[arr[0]] = arr[1] || 'true';
  });
  return result;
};

/**
*/
swby.base.Page.prototype.onload = swby.lang.abstractMethod;

// ****************************************************************************
// Config

/** @typedef {{
      api_key: (string|undefined),
      client_id: (string|undefined),
      scopes: (Array.<string>|undefined),
      get_token_from_server: (boolean|undefined),
      apis: (Array.<{name: string, version: string, root: (string|undefined)}>|undefined)
    }} */
swby.base.Config;

// ****************************************************************************
// class swby.base.Loader

// Control flow
// * Constructor
//   * Call loadGoogleApi_, which adds script tag and register handler
//     * Call authorize_
//       * Call finalize_
//     * Call loadApis_
//       * Call finalize_
//   * Add listener for DOMContentLoaded
//     * Create page and call finalize_
// * finalize_ init the page when it has been called three times.

/**
 @param {Function} page_class
 @constructor
 */
swby.base.Loader = function(config, page_class) {
  swby.base.EventHandler.call(this);
  /** @private {swby.base.Config} */
  this.config_ = config;
  /** @private {Function} */
  this.page_class_ = page_class;
  /** @private {swby.base.Page} */
  this.page_ = null;
  
  // Start the show.
  swby.promise.all([
    swby.promise.onDomEvent(document, 'DOMContentLoaded').then(function(event) {
      this.page_ = new this.page_class_;
    }, this.reportError_, this),
    this.loadGoogleApi_().then(function() {
      return new swby.promise.all([
        this.loadApis_(),
        this.authorize_()
      ]);
    }, this.reportError_, this)    
  ]).then(function() {
    this.page_.init();
    window.setInterval(this.refreshToken_.bind(this), this.token_refresh_interval_ms_);
  }, this.reportError_, this);
};
swby.lang.inherits(swby.base.Loader, swby.base.EventHandler);

/** @private {string} */
swby.base.Loader.prototype.gapi_callback_ = 'cranberry_gapi_loaded';

/** @private {string} */
swby.base.Loader.prototype.gapi_url_ = 'https://apis.google.com/js/client.js?onload=';

/** @private {number} */
swby.base.Loader.prototype.xhr_timeout_ms_ = 5000;

/** @private {string} */
swby.base.Loader.prototype.get_token_path_ = '/oauth2/token';

/** @private {number} */
swby.base.Loader.prototype.token_lifetime_s_ = 50 * 60;

/** @private {number} */
swby.base.Loader.prototype.token_refresh_interval_ms_ = 45 * 60 * 1000;

/** @private {string} */
swby.base.Loader.AUTH_DIALOG_HTML_ = '\
  <div class="modal fade" id="my-modal">\
    <div class="modal-dialog">\
      <div class="modal-content">\
        <div class="modal-header">\
          <h4 class="modal-title">Authorization needed</h4>\
        </div>\
        <div class="modal-body">\
          <p>This application requires authorization to access some Google APIs. Please click on "Proceed" to run through the authorization process.\
          This will open a popup window from Google where you will be to review the access rights and approve them.</p>\
        </div>\
        <div class="modal-footer">\
          <button type="button" class="btn btn-primary" data-dismiss="modal">Proceed</button>\
        </div>\
      </div>\
    </div>\
  </div>';

/**
 @param {*} reason
 @private
 */
swby.base.Loader.prototype.reportError_ = function(reason) {
  swby.base.showErrorDialog(reason.message, reason.details, true);
};

/**
 @return {swby.promise.Promise}
 @private
 */
swby.base.Loader.prototype.loadGoogleApi_ = function() {
  return new swby.promise.Promise(function(fulfill, reject) {
    var gapi_callback = this.gapi_callback_;
    // Setup callback.
    window[gapi_callback] = function() {
      delete window[gapi_callback];
      fulfill();
    }; 
    // Write SRC element to load the script.
    document.write('<script type="application/javascript" src="' + this.gapi_url_ + gapi_callback + '"></script>');    
  }, this);
};

/**
@return {swby.promise.Promise}
@private
*/
swby.base.Loader.prototype.authorize_ = function() {
  if (this.config_.api_key) gapi.auth.setApiKey(this.config_.api_key);
  if (this.config_.get_token_from_server) {
    return this.getOAuth2TokenFromServer_();
  } else if (this.config_.scopes && this.config_.scopes.length > 0) {
    return this.authorizeLocally_();
  } else {
    return swby.promise.resolved(null);
  }    
};

/**
@return {swby.promise.Promise}
@private
*/
swby.base.Loader.prototype.getOAuth2TokenFromServer_ = function() {
  return new swby.promise.Promise(function(fulfill, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = (function(event) {
      if (xhr.readyState != 4) return;
      if (xhr.status == 200) {
        try {
          var response = JSON.parse(xhr.responseText);
        } catch (e) {
          var response = null;
        }
        if (!response) {
          reject({message: 'Cannot get OAuth2 token', details: 'The server returned a malformed response:\n' + xhr.responseText});
        } else if (response.status == 200) {
          gapi.auth.setToken(response.result);      
          fulfill(null);
        } else {
          reject({message: 'Cannot get OAuth2 token', details: response});      
        }
      } else if (xhr.status == 0) {
        reject({message: 'Cannot get OAuth2 token', details: 'Timeout'});
      } else {
        reject({message: 'Cannot get OAuth2 token', details: xhr});  // TODO: is xhr the right value?
      }      
    }).bind(this);
    xhr.timeout = this.xhr_timeout_ms_;
    xhr.open('GET', this.get_token_path_ + '?min_lifetime_seconds=' + this.token_lifetime_s_);
    xhr.send();      
  }, this);
};

/**
 @param {boolean} immediate
 @param {Function} fulfill
 @param {Function} reject
 @private
 */
swby.base.Loader.prototype.authorizeLocallyAttempt_ = function(immediate, fulfill, reject) {
  var zhis = this;
  gapi.auth.authorize({client_id: this.config_.client_id, scope: this.config_.scopes.join(' '), immediate: immediate}, function(result) {
    if (result.error) {
      if (immediate) {
        zhis.showAuthDialog_(function() {
          zhis.authorizeLocallyAttempt_(false, fulfill, reject);
        });
      } else {
        reject({message: 'Authorization failure (' + result.error + ')'});
      }
    } else {
      fulfill();
    }    
  });  
};

/**
@private
*/
swby.base.Loader.prototype.authorizeLocally_ = function() {
  return new swby.promise.Promise(function(fulfill, reject) {
    this.authorizeLocallyAttempt_(true, fulfill, reject);
  }, this);
};

/**
 @param {function()} callback
 @private
 */
swby.base.Loader.prototype.showAuthDialog_ = function(callback) {
  var dialog = swby.util.renderHtmlAsElement(swby.base.Loader.AUTH_DIALOG_HTML_);
  document.body.appendChild(dialog);
  $(dialog).modal('show');
  $(dialog).on('hidden.bs.modal', function(event) {
    document.body.removeChild(dialog);
    callback();
  });
};

/**
 @private
*/
swby.base.Loader.prototype.loadApis_ = function() {
  var promises = [];
  this.config_.apis.forEach(function(api) {
    var root = api.root;
    if (root && root.charAt(0) == '/' && root.charAt(1) != '/') root = '//' + window.location.host + root;
    promises.push(new swby.promise.Promise(function(fulfill, reject) {
      gapi.client.load(api.name, api.version, null, root).then(function(resp) {
        if (resp && resp.error) reject({message: 'Cannot load API "' + api.name + '" (' + api.version + ')', details: resp});
        else fulfill();
      }, reject, this);      
    }, this));
  }, this);  
  return swby.promise.all(promises);
};

/**
@private
 */
swby.base.Loader.prototype.refreshToken_ = function() {
  if (this.config_.get_token_from_server) this.getOAuth2TokenFromServer_();
  else (this.authorize_());
};

/**
@param {Function} cls
*/
swby.base.init = function(config, cls) {
  new swby.base.Loader(config, cls);
};
