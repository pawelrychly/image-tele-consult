var Image = require('../../models/image');
var fs = require("fs")
var mongoose = require('mongoose')

module.exports.controller = function(app, passport) {

	app.get('/api/images', function(req, res, next) {
		var user = app.get('user') || false
	    var user_id = mongoose.Types.ObjectId(user._id.toString())
	    Image.find({user: user_id},{name: ""}, function(err, data) {
	    	if (err) {
	    		throw err;
	    	}
	    	console.log(data)
	    	res.render('api/images',{images: data});
	    });
	})	

	app.post('/api/images', function(req, res, next) {
		var user = app.get('user') || false
	    var user_id = mongoose.Types.ObjectId(user._id.toString())
	    var images = req.files || false
	    images = images.images	
		if( Object.prototype.toString.call( images ) !== '[object Array]' ) {
    		images = [images]
		}
		for (var i = 0; i < images.length; i++) {
			var imageFile = images[i];
			checkFileNameAndSave = function(file, data) {
	    		var fileName = /.*(?=\.)/.exec(file.originalname);
		  		var extension = /[^\.]*$/.exec(file.originalname);
		  		if (extension == fileName) {
		  			extension = ""
		  		}
				console.log("Filename")
				console.log(fileName)
				console.log("data:")
				console.log("{name:"+ (fileName+"."+extension)+", user: "+ user_id+"}")
	    		var originalName = file.originalname
	    		Image.count({originalname: originalName, user: user_id}, function( err, count) {
				    if (count > 0) {
				    	fileName = fileName + "-" + (count+1)
				    }
				    if (extension.length > 0) {
				    	fileName = fileName + "." + extension
				    }
				    console.log(count)
				    imageData = new Image({
				    	originalname: originalName,
				    	name: fileName,
			    		user: user_id,
			    		image: data,
					})
					imageData.save(function(err){
						if (err) throw err;
						fs.unlink(file.path, function (err) {
								if (err) throw err;
								console.log('successfully deleted ' + file.path);
						});
						res.json({status:"OK"})	
					});	
				});
	    	}
			saveFileToMongoDB = function(file) {
			    if (file.mimetype.match('image.*') || file.mimetype.match('.*dicom')) {
			    console.log("Reading file" + file.path)
			    fs.readFile(file.path, function (err, data) {
			    	checkFileNameAndSave(file, data)
				});
			  }
			}
			saveFileToMongoDB(imageFile);
        } 
	})
}