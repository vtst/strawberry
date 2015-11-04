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
  console.log('init');
  this.loaded();
}

example.CONFIG_ = {
    apis: [{name: 'calendar', version: 'v3'}],
    client_id: '128116520821-dullqdj9l0fd4ljhsjf849kraga0j8sd.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/calendar.readonly'],
    get_token_from_server: false
};

swby.base.init(example.CONFIG_, example.Page);
