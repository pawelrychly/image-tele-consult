
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
                res.render('messages',  { error: error.message });
            }
            else {
                console.log(account)
                Account.createToken(account.email, function(err, createdToken) {
                    if (err) {
                        res.render('messages',{error: 'Error during token generating'});
                    } else {
                        res.json({email: user.email, token : createdToken});    
                    }
                });
            }
        });
	})
}