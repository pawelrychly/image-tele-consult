var mongoose = require('mongoose')
Schema = mongoose.Schema

var actionSchema = new Schema({
    imageID: {type: Schema.Types.ObjectId, required: true},
    userID: { type: Schema.Types.ObjectId, required: true },
    objectID: { type: Number, required: true},
    mode: {type: String, required: true},
    timestamp: {type: Date, default: Date.now},
    x: {type: Number, required:false},
    y: {type: Number, required:false},
    width: {type: Number, required:false},
    height: {type: Number, required:false},
    color: {type: Number, required:false},
    content: {type: String, required:false},
    type: {type: String, required:false}
})

var Action = mongoose.model('Action', actionSchema);
module.exports = Action;