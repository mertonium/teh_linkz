
/*
 * GET home page.
 */

exports.index = function(req, res){
  //res.render('index', { title: 'Express' })
  res.redirect(singly.getAuthorizeURL('facebook'));
};

exports.auth_callback = function(req, res) {
  singly.getAccessToken(req.param('code'), function(err, access_token) {
    accessToken = access_token;
    res.redirect('/all');
  });
};

exports.types_all = function(req, res) {
  if (!accessToken) return res.redirect('/');
  singly.apiCall('/types/all', {access_token:accessToken}, function(err, resp) {
    if(err) return res.send(err, 500);
    res.send(resp);
  });
}