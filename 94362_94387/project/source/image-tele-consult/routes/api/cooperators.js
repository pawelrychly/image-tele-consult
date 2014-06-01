var Image = require('../../models/image');
var Permission = require('../../models/permission');
var Account = require('../../models/account');
var fs = require("fs")
var mongoose = require('mongoose')
var mkdirp = require('mkdirp')
var path = require('path')

module.exports.controller = function(app, passport) {

	app.delete('/api/cooperators/:imageid/:userid', function(req, res, next) {
		var imageID = req.params.imageid
		var imageID = mongoose.Types.ObjectId(imageID)
		var userID = req.params.userid
		var userID = mongoose.Types.ObjectId(userID)
		
		Permission.remove({userID: userID, imageID: imageID}, function(err){
			if (err) throw err;
			res.json({status:"OK"})	
		})
	})

	app.post('/api/cooperators/:imageid/:email', function(req, res, next) {
		var user = req.user || false
		var imageID = req.params.imageid
		imageID = mongoose.Types.ObjectId(imageID)
		var email = req.params.email
		Account.find({email:email}, {_id:""}, function(err, users) {
			if (err) throw err;
			
			if (users.length == 0) {
				console.log("OK0")
				res.json({iscomplete: false, message: "user doesn't exist"})
			} else {
				var userID = users[0]._id
				if (userID == user._id.toString()) {
					res.json({iscomplete: false, message: "You are the owner of this file"})
				} else {
					userID = mongoose.Types.ObjectId(userID.toString())
					var permission = new Permission({
						userID: userID,
						imageID: imageID
					})
					
					permission.save(function(err){
						if (err) {
							res.json({iscomplete:true ,message:"A user already has a  permissions to this file. "})	
						}
						console.log("saved")
						res.json({iscomplete:true ,message:"Operation completed"})	
					})	
				}
			}
		})
	})

	app.get('/api/cooperators/:imageid', function(req, res, next) {
		console.log("DIR: /api/cooperators/:imageid")
		var user = req.user || false
	    var user_id = mongoose.Types.ObjectId(user._id.toString())
	    var imageid = req.params.imageid
	    Permission.find({$and :[{imageID:imageid}, {userID:{$ne: user_id }}]}, {imageID:"", userID:""}, function(err, permissions) {
	    	if (err) throw err;
	    	userIDS = permissions.map(function(permission) {
	    		return permission.userID
	    	});
	    	Account.find({_id: {$in: userIDS}},{email: "", _id: ""}, function(err, users) {
		    	if (err) {
		    		throw err;
		    	}
		    	var dataToDisplay = []
		    	for (i in users) {
		    		dataToDisplay.push({
		    			email: users[i].email,
		    			_id: users[i]._id,
		    		})
		    	}
	    		console.log("cooperators: dataToDisplay")
	    		res.render("api/cooperators",{cooperators:dataToDisplay, length:dataToDisplay.length});	
		    	
	    	});	
	    })
	})	
}