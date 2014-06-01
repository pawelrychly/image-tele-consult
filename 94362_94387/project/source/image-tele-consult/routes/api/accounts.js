var Image = require('../../models/image');
var Permission = require('../../models/permission');
var Account = require('../../models/account');
var fs = require("fs")
var mongoose = require('mongoose')
var mkdirp = require('mkdirp')
var path = require('path')

module.exports.controller = function(app, passport) {

	app.get('/api/accounts', function(req, res, next) {
		console.log("DIR: /api/accounts")
		var user = req.user || false
	    var user_id = mongoose.Types.ObjectId(user._id.toString())
	    Account.find({}, {email:"", _id:""}, function(err, accounts) {
	    	if (err) throw err;
			res.json(accounts);
	    })
	})	
}