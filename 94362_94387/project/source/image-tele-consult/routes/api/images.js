var Image = require('../../models/image');
var Permission = require('../../models/permission');
var Account = require('../../models/account');
var fs = require("fs")
var mongoose = require('mongoose')
var mkdirp = require('mkdirp')
var path = require('path')
var gm = require('gm')
var streamifier = require('streamifier')

module.exports.controller = function(app, passport) {
	var getPathWithProperExtension = function(path, newext) {
		var pathArray = path.split(".");
		if( pathArray.length === 1 || ( pathArray[0] === "" && pathArray.length === 2 ) ) {
		    return path;
		}
		pathArray.pop()
		pathArray.push(newext)
		path = pathArray.join(".")
		return(path)
	}

	var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

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

	app.put('/api/images/:id', function(req, res, next) {
		checkPermissions(req, res, next)
	})

	app.delete('/api/images/:id', function(req, res, next) {
		checkPermissions(req, res, next)
	})

	//serving an image
	app.get('/api/images/:id', function(req, res, next) {
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
					        if (!endsWith(image.mimetype, "jpeg") && !endsWith(image.mimetype, "jpeg")) {
					        	var newDir = getPathWithProperExtension(resolvedDir,"jpg")
						        var writeStream = fs.createWriteStream(newDir);
								var stream = gm(resolvedDir).stream('jpg');
								stream.pipe(writeStream, { end: false });
  								stream.on("end", function() {
  									var img = fs.readFileSync(newDir);
	  								console.log(img)
	  								res.writeHead(200, {'Content-Type': "image/jpeg" });
	     							res.end(img, 'binary');
	     							fs.unlink(newDir, function (err) {
										if (err) throw err;
										console.log('dir successfully deleted');
									});
  								})
  								
						    } else {
						    	var img = fs.readFileSync(resolvedDir);
  								console.log('Goodbye\n');
								res.writeHead(200, {'Content-Type': image.mimetype });
     							res.end(img, 'binary');
     							fs.unlink(resolvedDir, function (err) {
									if (err) throw err;
									console.log('dir successfully deleted');
								});
						    }
					        
					        //
     						//console.log(newDir)
     						
					    }
					});
				});
			}				
		})
	})	

	app.get('/api/images/:id/editor', function(req, res, next) {
		console.log("DIR: /api/images/editor")
		var user = req.user || false
	    var user_id = mongoose.Types.ObjectId(user._id.toString())
		var id = req.params.id
		var image_id = mongoose.Types.ObjectId(id)
		Account.findOne({_id: user_id}, function(err, usr) {
            res.render("api/editor", {imageid:image_id.toString(), token: usr.token.token})
        });
	})	

	app.get('/api/images/:id/download', function(req, res, next) {
		var user = req.user || false
		user_id = mongoose.Types.ObjectId(user._id.toString())
		id = req.params.id
		var image_id = mongoose.Types.ObjectId(id)
		Image.find({_id: image_id}, {name:"", mimetype:""}, function(err, data){
			if (err) throw err;
			if (data.length > 0) {
				image = data[0]
				name = image.name
				type = image.mimetype			    
			    var fileDir = __dirname + '/../../uploads/' + user_id;
				fileName = fileDir + "/" + image.name
				fileName = path.resolve(fileName);
				res.download(fileName, function(err){
					if (err) {
					throw err;
					} else {
						fs.unlink(fileName, function (err) {
						if (err) throw err;
						console.log('dir successfully deleted');
					});
}
				});
			}
		});
	});

	app.post('/api/images/:id/download', function(req, res, next) {
		var user = req.user || false
		user_id = mongoose.Types.ObjectId(user._id.toString())
		id = req.params.id
		var image_id = mongoose.Types.ObjectId(id)
		Image.find({_id: image_id}, {name:"", mimetype:""}, function(err, data){
			if (err) throw err;
			if (data.length > 0) {
				image = data[0]
				name = image.name
				type = image.mimetype
				var imageFile = req.body.images || false
			    downloadFile = function(imageFile, filetype) {
  					console.log(imageFile) 
  					fileName = fileDir + "/" + image.name
  					fileName = path.resolve(fileName);
  					var writeStream = fs.createWriteStream(fileName);
					var arr = imageFile.split(",");
					var head = arr.splice(0,1).join("");
					var imageFile = arr.join(",");
					var img = new Buffer(imageFile, 'base64');
					
					//var readStream = streamifier.createReadStream(img)
					//console.log(readStream)
					var stream = gm(img, 'img.jpg').stream(filetype);
					stream.pipe(writeStream, { end: false });
					stream.on("end", function() {
						res.json({status:"OK"})
					})
				}
			    var fileDir = __dirname + '/../../uploads/' + user_id;
			    if (type.match(".*dicom")) {
	  				mkdirp(fileDir,downloadFile(imageFile, "dcm"));
			    } else{
			    	mkdirp(fileDir,downloadFile(imageFile, "jpg"));
			    }
			}
		});
		/*var user = req.user || false
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
			}				
		})*/
	})	

	app.delete('/api/images/:id', function(req, res, next) {
		var id = req.params.id
		var image_id = mongoose.Types.ObjectId(id)
		Image.remove({_id: image_id }, function(err){
			if (err) throw err;
			Permission.remove({imageID:image_id}, function(){
				res.json({status:"OK"})	
			})
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
			    		isforeign = false
			    		console.log(user_id.toString())
			    		console.log(images[i].user.toString())
			    		console.log("FIND")
			    		if (images[i].user.toString() != user_id.toString()) {
			    			isforeign = true
			    		}
			    		console.log(isforeign)
			    		dataToDisplay.push({
			    			_id: images[i]._id,
			    			name: images[i].name,
			    			size: images[i].size,
			    			user: emailsByIds[images[i].user],
			    			isforeign: isforeign
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
			    		size: file.size,
			    		mimetype: file.mimetype
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