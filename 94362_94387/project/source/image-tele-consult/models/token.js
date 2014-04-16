mongoose = require('mongoose');
Schema = mongoose.Schema

var tokenSchema = new Schema({
	token: {type: String},
	created: {type: Date, default: Date.now}
})

var Token = mongoose.model('Token', tokenSchema)