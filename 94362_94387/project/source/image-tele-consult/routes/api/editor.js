var fs = require("fs")
var mongoose = require('mongoose')
var path = require('path')

module.exports.controller = function(app, passport) {
	app.get('/api/editor', function(req, res, next) {
		console.log("DIR: /api/editor")
		res.render("api/editor")
	})	
}