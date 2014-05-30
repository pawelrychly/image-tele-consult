var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs')
var multer = require('multer')

//SSL config
var https = require('https');
var key = fs.readFileSync('./localhost-key.pem');
var cert = fs.readFileSync('./localhost-cert.pem')
var https_options = {
    key: key, 
    cert: cert
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(multer({ dest: './uploads/'}))

var Account = require(__dirname +'/models/account')
passport.use(Account.createStrategy());
mongoose.connect('mongodb://localhost/image-tele-consult');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("MongoDB: connection established!")
});

//reading token
app.use(function(req, res, next) {
    res.locals.user = {email: false};
    if (typeof req.headers.email !== 'undefined'){
        res.locals.user = {email: req.headers.email};            
    } 
    next();
});

readFilesFromDirectory = function getFiles(dir, list){
    var files = fs.readdirSync(dir);
    for(var i in files){
        if (!files.hasOwnProperty(i)) continue;
        var name = dir+'/'+files[i];
        if (!fs.statSync(name).isDirectory()){
            list.push(name)
        }
    }
    for(var i in files){
        if (!files.hasOwnProperty(i)) continue;
        var name = dir+'/'+files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, list);
        }
    }
    return list
}

readFilesFromDirectory('./routes', []).forEach(function (file) {
  if(file.substr(-3) == '.js') {
      route = require(file);
      route.controller(app, passport);
  }
});


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});



/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports.app = app;
module.exports.https_options = https_options
