
var path = require('path');
var Account = require(path.join(__dirname, '..', '/models/account'));

module.exports.controller = function(app, passport) {
	app.get('/sign-up', function(req, res) {
		res.render('sign-up', { title: 'Image TeleConsult' });
	});

	app.post('/sign-up', function(req, res) {
		var email = req.body.email;
        var password = req.body.password;
        var user = new Account({email: email});

        Account.register(user, password, function(error, account) {
            if (error) {
                res.render('sign-up',  { error: error.message });
            }
            else {
                res.redirect('/api');
            }
        });
	})
}