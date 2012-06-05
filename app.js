
/**
 * Module dependencies.
 */

var express = require('express'),
    Singly = require('singly'),
    _ = require('underscore'),
    routes = require('./routes');

var clientID = process.env.SINGLY_CLIENT_ID;
var clientSecret = process.env.SINGLY_CLIENT_SECRET;

var accessToken;

var app = module.exports = express.createServer();

var singly = new Singly(clientID, clientSecret, 'http://localhost:8080/callback');
//console.log(singly);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res) {
  res.redirect(singly.getAuthorizeURL('twitter'));
});
app.get('/callback', function(req, res) {
  singly.getAccessToken(req.param('code'), function(err, access_token) {
    accessToken = access_token;
    res.redirect('/news_feed');
  });
});


app.get('/news_feed', function(req, res) {
  if (!accessToken) return res.redirect('/');
  singly.apiCall('/types/news_feed', {access_token:accessToken}, function(err, resp) {
    if(err) return res.send(err, 500);
    var news = [], item = {};
    _.each(resp, function(el, idx) {
      item = {};
      item.id = el.id;
      if (el.oembed && el.oembed.type == "link") {
        item.description = el.oembed.description;
        item.url = el.oembed.url;
        item.source = el.data.user.name;
        item.thumbnail_url = el.oembed.thumbnail_url || "http://placehold.it/80&text=wtf";
      }
      news.push(item);
    });
    res.render('news_feed', { title: "Clique News", news: news });
    //res.send(news);
  });
});


app.get('/all', function(req, res) {
  if (!accessToken) return res.redirect('/');
  singly.apiCall('/types/all', {access_token:accessToken}, function(err, resp) {
    if(err) return res.send(err, 500);
    res.send(resp);
  });
});
app.listen(8080, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
