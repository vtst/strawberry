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
  gapi.client.plus.people.get( {'userId' : 'me'} ).execute(function(resp) {
    document.getElementById('body').textContent = 'Hello ' + resp.displayName + '!';
    zhis.loaded();
  });
}

example.CONFIG_ = {
    apis: [{name: 'plus', version: 'v1'}],
    client_id: '128116520821-dullqdj9l0fd4ljhsjf849kraga0j8sd.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/plus.login'],
    get_token_from_server: false
};

swby.base.init(example.CONFIG_, example.Page);
