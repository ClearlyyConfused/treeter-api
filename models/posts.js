var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
	author: { type: String, required: true },
	content: { type: String, required: true },
});

module.exports = mongoose.model('posts', PostSchema);
