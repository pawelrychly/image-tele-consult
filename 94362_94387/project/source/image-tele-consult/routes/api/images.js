var Image = require('../../models/image');
var Permission = require('../../models/permission');
var Account = require('../../models/account');
var fs = require("fs")
var mongoose = require('mongoose')
var mkdirp = require('mkdirp')
var path = require('path')

module.exports.controller = function(app, passport) {

	app.get('/api/images/:id/download', function(req, res, next) {
		var user = req.user || false
	    var user_id = mongoose.Types.ObjectId(user._id.toString())
		var id = req.params.id
		var image_id = mongoose.Types.ObjectId(id)
		Image.find({_id: image_id }, function(err, data){
			if (err) throw err;
			if (data.length > 0) {
				image = data[0]
				var fileDir = __dirname + '/../../uploads/' + user_id;
  				mkdirp(fileDir, function(err) { 
  					fileName = fileDir + "/" + image.name
  					fs.writeFile(fileName, image.image, function(err) {
					    if(err) {
					        console.log(err);
					    } else {
					        resolvedDir = path.resolve(fileName);
					        console.log(resolvedDir)
					        res.download(resolvedDir, function(err){
							  if (err) {
							    throw err;
							  } else {
							  	fs.unlink(resolvedDir, function (err) {
									if (err) throw err;
									console.log('dir successfully deleted');
								});
							  }
							});
					    }
					});
				});

  				  				//res.download(file); // Set disposition and send it.
			}
			
			/*fs.writeFile("//test", "Hey there!", function(err) {
			    if(err) {
			        console.log(err);
			    } else {
			        console.log("The file was saved!");
			    }
			}); */
				
		})
	})	

	app.delete('/api/images/:id', function(req, res, next) {
		var id = req.params.id
		var image_id = mongoose.Types.ObjectId(id)
		Image.remove({_id: image_id }, function(err){
			if (err) throw err;
			res.json({status:"OK"})	
		})
	})

	app.get('/api/images', function(req, res, next) {
		console.log("DIR: /api/images")
		//var user = app.get('user') || false
	    var user = req.user || false
	    
	    var user_id = mongoose.Types.ObjectId(user._id.toString())
	    Permission.find({userID:user_id}, {userID:"", imageID:""}, function(err, permissions) {
	    	/*var ids = ['512d5793abb900bf3e20d012', '512d5793abb900bf3e20d011'];
			ids = ids.map(function(id) { return ObjectId(id); });
			db.test.find({_id: {$in: ids}});*/
			if (err) throw err;
			var ids = permissions.map(function(permission) {
				return permission.imageID
			})

			Image.find({_id: {$in: ids}},{name: "", _id: "", size: "0", user:""}, function(err, images) {
		    	console.log("images")
		    	if (err) {
		    		throw err;
		    	}
		    	Account.find({}, {email:"", _id:""}, function(err, users) {
		    		console.log("accounts")
		    		var emailsByIds = {}
		    		for (i in users) {
		    			emailsByIds[users[i]._id.toString()] = users[i].email
			    	} 
			    	console.log(emailsByIds)
			    	var dataToDisplay = []
			    	for (i in images) {
			    		dataToDisplay.push({
			    			_id: images[i]._id,
			    			name: images[i].name,
			    			size: images[i].size,
			    			user: emailsByIds[images[i].user]
			    		})
			    	}
			    	//console.log(dbata)
			    	res.render('api/images',{images: dataToDisplay});
			    }) 
	    	});	
	    })
	})	

	app.post('/api/images', function(req, res, next) {
		var user = req.user || false
	    
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
				
	    		var originalName = file.originalname
	    		Image.count({originalname: originalName, user: user_id}, function( err, count) {
				    if (count > 0) {
				    	fileName = fileName + "-" + (count+1)
				    }
				    if (extension.length > 0) {
				    	fileName = fileName + "." + extension
				    }
				   
				    var imageData = new Image({
				    	originalname: originalName,
				    	name: fileName,
			    		user: user_id,
			    		image: data,
			    		size: file.size
			 		})
			 		var permissionData = new Permission({
			 			imageID: imageData._id,
			 			userID: user_id
			 		})
					imageData.save(function(err){
						if (err) throw err;
						fs.unlink(file.path, function (err) {
							if (err) throw err;
							console.log('successfully deleted ' + file.path);
						});
						permissionData.save(function() {
							res.json({status:"OK"})	
						})
					});
						
				});
	    	}
			saveFileToMongoDB = function(file) {
			    if (file.mimetype.match('image.*') || file.mimetype.match('.*dicom')) {
				    fs.readFile(file.path, function (err, data) {
				    	checkFileNameAndSave(file, data)
					});
			  	}
			}
			saveFileToMongoDB(imageFile);
        } 
	})
}