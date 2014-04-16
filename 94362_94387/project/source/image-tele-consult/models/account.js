var mongoose = require('mongoose')
passportLocalMongoose = require('passport-local-mongoose')

secretString = ".,2.p;/A@#akio32.;2323j23;l"
Schema = mongoose.Schema


var accountSchema = new Schema({
	email: { type: String, required: true, index: {unique:true }, lowercase:true },
	created: {type: Date, default: Date.now },
	token: {type: Object},
})

accountSchema.plugin(passportLocalMongoose, { usernameField: 'email' })
var Account = mongoose.model('Account', accountSchema);
module.exports = Account; 
