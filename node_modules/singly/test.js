var Singly = require('./lib');
var express = require('express');

var clientID = process.argv[2];
var clientSecret = process.argv[3];

var singly = new Singly(clientID, clientSecret, 'http://localhost:8044/callback');

var app = express.createServer();

var accessToken;

app.get('/', function(req, res) {
  res.redirect(singly.getAuthorizeURL('facebook'));
});

app.get('/callback', function(req, res) {
  singly.getAccessToken(req.param('code'), function(err, access_token) {
    accessToken = access_token;
    res.redirect('/all');
  });
});

app.get('/all', function(req, res) {
  if (!accessToken) return res.redirect('/');
  singly.apiCall('/types/all', {access_token:accessToken}, function(err, resp) {
    if(err) return res.send(err, 500);
    res.send(resp);
  });
});

app.listen(8044);
console.log('open http://localhost:8044');