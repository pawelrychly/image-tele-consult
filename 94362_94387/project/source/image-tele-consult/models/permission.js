var mongoose = require('mongoose')
Schema = mongoose.Schema

var permissionSchema = new Schema({
    imageID: { type: Schema.Types.ObjectId, required: true },
    userID: { type: Schema.Types.ObjectId, required: true },
})

var Permission = mongoose.model('Permission', permissionSchema);
module.exports = Permission; 