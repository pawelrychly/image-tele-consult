var Account = require('../models/account');


module.exports.controller = function(app, passport) {
	
	app.all('/api*', function(req, res, next) {
		//console.log(req)
		//console.log(req.param)
		console.log('headers')
		console.log(req.headers)
		var token = req.headers['x-token'] || req.param('token') || null;
		console.log(token)
		if (token !== null) {
			Account.checkUserToken(token, function(isLoggedIn, usr) {
	        	if (isLoggedIn) {
	        		console.log("You are logged In2");
	        		app.set('user', usr);
	        		next();
	        	} else {
	        		console.log("Is not logged in")
	        		res.redirect('/sign-in')
	        	}
        	})		
		} else { 
			console.log("User but no token")
			user = app.get('user') || false
			if (user) {
				console.log("No token. User:" + user)
				res.render('api')
			} else {
				console.log("User is not logged.")
				res.redirect('/sign-in')
			}
		}
	});
	
	app.get('/api', function(req, res) {
		console.log("Application User")
		user = app.get('user')
		console.log(user)
		res.render('api', { title: 'Image TeleConsult', success: req.param('success') });
	});

	app.get('/', function(req, res) {
		res.redirect('/api');
	});

	app.get('/api/sign-out', function(req, res) {
        console.log('headers')
		console.log(req.headers)
		var token = req.headers['x-token'] || req.param('token') || null;
		console.log(token)
		if (token) {
            Account.removeToken(token, function(err, usr) {
                if (!err) {
                    app.set('user', false)
                    res.json({isLoggedOut: true});
                } else {
                	console.log("Error during log out.")
                }           
            })
        }
	});
}