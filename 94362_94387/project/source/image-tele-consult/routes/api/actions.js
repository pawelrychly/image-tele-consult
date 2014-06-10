var Action = require('../../models/action');
var Permission = require('../../models/permission');
var mongoose = require('mongoose')

module.exports.controller = function(app, passport) {

	var checkPermissions = function(req, res, next) {
		console.log("checking permissions")
		var user = req.user || false
		var user_id = mongoose.Types.ObjectId(user._id.toString())
		var imageid = req.params.id
		var image_id = mongoose.Types.ObjectId(imageid)
		Permission.find({userID:user_id, imageID:image_id}, function(err, permissions) {
	    	if (err) throw err;
	    	console.log("permissions")
	    	console.log(user_id)
			console.log(image_id)
			console.log(permissions)
			if (permissions.length > 0) {
				next()
			} else {
				res.json({status: "ERROR", message: "You have no permissions to this file"})
			}
		})
	}

	app.get('/api/actions/:id', function(req, res, next) {
		console.log("ACTIONS")
		checkPermissions(req, res, next)
	})

	app.get('/api/actions/:id', function(req,res,next){
		var user = req.user || false
	    var user_id = mongoose.Types.ObjectId(user._id.toString())
	    var imageid = req.params.id
		var image_id = mongoose.Types.ObjectId(imageid)
	    console.log("acTIONS")
	    Action.find({imageID: image_id},{}, {sort:{timestamp: 1}}, function(err, actions) {
	    	if (err) throw err;
	    	console.log(actions)
			res.json({status:"OK", actions:actions});
	    })
	})
}