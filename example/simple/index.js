var CONFIG = {
    apis: [{name: 'plus', version: 'v1'}],
    clientId: '128116520821-dullqdj9l0fd4ljhsjf849kraga0j8sd.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/userinfo.email',
             'https://www.googleapis.com/auth/plus.login'],
    firebase: {
      version: '3.6.0',
      apiKey: 'AIzaSyCpkSttW6H5_JscIImSgriVosEQ8P4FYlA',
      authDomain: 'vtst-strawberry.firebaseapp.com',
      databaseURL: 'https://vtst-strawberry.firebaseio.com',
      storageBucket: 'vtst-strawberry.appspot.com',
      messagingSenderId: '128116520821'     
    },
    get_token_from_server: false
};

swby.gapi.init(CONFIG).then(function(resp) {
  gapi.client.plus.people.get( {'userId' : 'me'} ).execute(function(resp) {
    document.getElementById('body').textContent = 'Hello ' + resp.displayName + '!';
    document.body.classList.remove('swby-loading');
  });
}, function(err) {
  console.log('ERROR', err, err.stack);
});
