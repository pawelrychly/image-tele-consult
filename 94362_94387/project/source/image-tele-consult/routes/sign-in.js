var Account = require('../models/account');

module.exports.controller = function(app, passport) {
	
    app.post('/sign-in', function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) {
                console.log("Error")
                res.render('messages', {error: 'Unknown Error.'});  
            }
            if (!user) { 
                console.log("Not user")
                res.render('messages', {error: 'Incorrect login or password!'}); 
            }
            if (!err && user) {
                console.log("USER:")
            console.log(user)
                Account.createToken(user.email, function(err, createdToken) {
                    if (err) {
                        res.render('messages',{error: 'Error during token generating'});
                    } else {
                        res.json({email: user.email, token : createdToken});    
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
        console.log('LOGOUT: incomingToken: ' + incomingToken);
        if (incomingToken) {
            var decoded = Account.decode(incomingToken);
            if (decoded && decoded.email) {
                console.log("past first check...invalidating next...")
                Account.invalidateUserToken(decoded.email, function(err, user) {
                    console.log('Err: ', err);
                    console.log('user: ', user);
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