var Account = require('../models/account');

module.exports.controller = function(app, passport) {
	
    app.post('/sign-in', function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) {
                res.render('messages', {error: 'Unknown Error.'});  
            }
            if (!user) { 
                res.render('messages', {error: 'Incorrect login or password!'}); 
            }
            if (!err && user) {
                Account.createToken(user.email, function(err, createdToken) {
                    if (err) {
                        res.render('messages',{error: 'Error during token generating'});
                    } else {
                        console.log({email: user.email, id: user._id, token : createdToken})
                        res.json({email: user.email, id: user._id, token : createdToken});    
                    }
                });
            }
        })(req, res, next);
    })

	app.get('/sign-in', function(req, res) {
		res.render('sign-in')
	});


    app.get('/logout(\\?)?', function(req, res) {
        var messages = flash('Logged out', null);
        var incomingToken = req.headers.token;
        if (incomingToken) {
            var decoded = Account.decode(incomingToken);
            if (decoded && decoded.email) {
                Account.invalidateUserToken(decoded.email, function(err, user) {
                    if (err) {
                        console.log(err);
                        res.json({error: 'Issue finding user (in unsuccessful attempt to invalidate token).'});
                    } else {
                        console.log("sending 200")
                        res.json({message: 'logged out'});
                    }
                });
            } else {
                console.log('Whoa! Couldn\'t even decode incoming token!');
                res.json({error: 'Issue decoding incoming token.'});
            }
        }
    });
}