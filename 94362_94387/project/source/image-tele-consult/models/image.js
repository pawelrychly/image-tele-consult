var mongoose = require('mongoose')
Schema = mongoose.Schema

var imageSchema = new Schema({
    originalname: {type: String, required: true},
    name: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, required: true},
    created: {type: Date, default: Date.now },
    image: {type: Buffer, required:true},
    size: {type: Number, required:true},
    mimetype: {type: String, required: true}
})

var Image = mongoose.model('Image', imageSchema);
module.exports = Image; 