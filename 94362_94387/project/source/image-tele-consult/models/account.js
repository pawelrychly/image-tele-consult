var mongoose = require('mongoose')
var passportLocalMongoose = require('passport-local-mongoose')
var Token = require('./token')
var jwt = require('jwt-simple')

secretString = ".,2.p;/A@#akio32.;2323j23;l"
Schema = mongoose.Schema


var accountSchema = new Schema({
	email: { type: String, required: true, index: {unique:true }, lowercase:true },
	created: {type: Date, default: Date.now },
	token: {type: Object},
})

accountSchema.plugin(passportLocalMongoose, { usernameField: 'email' })


accountSchema.statics.createToken = function(email, callback) {
    var self = this;
    this.findOne({email: email}, function(err, usr) {
        var token = jwt.encode({email: email}, secretString);
        usr.token = new Token({token:token});
        usr.save(function(err, usr) {
            if (err) {
                callback(err, null);
            } else {
                callback(false, usr.token.token);
            }
        });
    });
};


accountSchema.statics.checkUserToken = function(token, callback) {
    var dataFromToken = false
    try{
        var dataFromToken = jwt.decode(token, secretString);
    } catch(err) {
        dataFromToken = false
    }
    if (dataFromToken && dataFromToken.email) {
        var self = this;
        this.findOne({email: dataFromToken.email}, function(err, usr) {
            usr.token = new Token(usr.token)
            
            if(!err && usr && usr.token.token 
                && token === usr.token.token && !usr.token.hasExpired()) {
    
                callback(true, usr); 
            } else {
                callback(false, null);  
            }
        });
    } else {
        callback(false, null);  
    } 
};

accountSchema.statics.removeToken = function(token, callback) {
    var dataFromToken = false
    try{
        var dataFromToken = jwt.decode(token, secretString);
    } catch(err) {
        dataFromToken = false
    }
    if (dataFromToken && dataFromToken.email) {
        var self = this;
        this.findOne({email: dataFromToken.email}, function(err, usr) {
            usr.token = null;
            usr.save(function(err, usr) {
                console.log("removing...")
                if (err) {
                    console.log('callback err')
                    callback(err, null);
                } else {
                    console.log('callback ok')
                    callback(false, 'removed');
                }
            });
        });
    } else {
        callback(false, 'incorrect token');  
    } 
};

var Account = mongoose.model('Account', accountSchema);
module.exports = Account; 

