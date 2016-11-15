var CONFIG = {
    apis: [{name: 'example', version: 'v1', root: '/_ah/api'}],
    clientId: '128116520821-dullqdj9l0fd4ljhsjf849kraga0j8sd.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/userinfo.email']
};

swby.gapi.init(CONFIG).then(function(resp) {
  gapi.client.example.sayHiAuth({'name': 'You'}).then(function(resp) {
    document.getElementById('body').textContent = resp.result.data;
    zhis.loaded();
  }, function(err) {
    console.log('ERROR', err);
  });
  gapi.client.example.sayLongHi({
    'firstName': 'Vincent',
    'lastName': 'Simonet',
    'middleName': 'X',
    'weekday': 'Monday',
    'location': 'Paris'
  }).then(function(resp) {
    document.getElementById('body').textContent = resp.result.data;
    zhis.loaded();
  }, function(err) {
    console.log('ERROR', err);
  });
}, function(err) {
  console.log('ERROR', err);
});
