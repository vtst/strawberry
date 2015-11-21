swby.lang.namespace('example');

/**
@constructor
@extends {swby.base.Page}
 */
example.Page = function() {
  swby.base.Page.call(this);
};
swby.lang.inherits(example.Page, swby.base.Page);

/**
 */
example.Page.prototype.init = function() {
  var zhis = this;
  gapi.client.example.sayHiAuth({'name': 'You'}).then(function(resp) {
    document.getElementById('body').textContent = resp.result.data;
    zhis.loaded();
  }, swby.base.apiErrorHandler("Cannot say Hi", true), this);
};

example.CONFIG_ = {
    apis: [{name: 'example', version: 'v1', root: '/_ah/api'}],
    client_id: '128116520821-dullqdj9l0fd4ljhsjf849kraga0j8sd.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/userinfo.email'],
    get_token_from_server: false
};

swby.base.init(example.CONFIG_, example.Page);
