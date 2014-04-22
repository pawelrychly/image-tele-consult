mongoose = require('mongoose');
Schema = mongoose.Schema

tokenLifeTime = 7200000

var tokenSchema = new Schema({
	token: {type: String},
	created: {type: Date, default: Date.now}
})

tokenSchema.methods.hasExpired = function() {
    var now = new Date();
    var diff = (now.getTime() - this.created);
    return diff > tokenLifeTime;
};

var Token = mongoose.model('Token', tokenSchema)



module.exports = Token;