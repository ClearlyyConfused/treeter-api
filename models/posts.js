var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
	author: { type: String, required: true },
	content: { type: String, required: true },
	timestamp: { type: String, required: true },
	comments: { type: Array, required: true },
	likes: { type: Array, required: true },
	views: { type: Number, required: true },
	updated: { type: Boolean },
});

module.exports = mongoose.model('posts', PostSchema);
