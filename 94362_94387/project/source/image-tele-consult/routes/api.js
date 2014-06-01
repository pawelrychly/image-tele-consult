var Account = require('../models/account');


module.exports.controller = function(app, passport) {
	
	var getUser = function(req, res, next) {
		console.log("getUser")
		var token = req.headers['x-token'] || req.param('token') || null;
		if (token !== null) {
			Account.checkUserToken(token, function(isLoggedIn, usr) {
	        	if (isLoggedIn) {
	        		console.log("You are logged In2");
	        		req.user = usr
	        		//app.set('user', usr);
	        		next();
	        	} else {
	        		console.log("Is not logged in")
	        		res.redirect('/sign-in')
	        	}
        	})		
		} else { 
			console.log("No token")
			res.redirect('/sign-in')
			/*user = app.get('user') || false
			if (user) {
				console.log(user)
				console.log("User but no token")
				res.render('api')
			} else {
				console.log("User is not logged.")
				
			}*/
		}
	}

	app.all('/api', function(req, res, next) {
		console.log("/API")
		getUser(req,res,next)
	});

	app.all('/api/*', function(req, res, next) {
		console.log("/API/*")
		getUser(req,res,next)
	});
	
	app.get('/api', function(req, res) {
		user = req.user || false//app.get('user')
		res.render('api', { title: 'Image TeleConsult', success: req.param('success'), email:user.email});
	});

	app.get('/', function(req, res) {
		res.redirect('/api');
	});

	app.get('/api/sign-out', function(req, res) {
        
		var token = req.headers['x-token'] || req.param('token') || null;
		if (token) {
            Account.removeToken(token, function(err, usr) {
                if (!err) {
                    //app.set('user', false)
                    res.json({isLoggedOut: true});
                } else {
                	console.log("Error during log out.")
                }           
            })
        }
	});
}