var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	author: { type: String, required: true },
	content: { type: String, required: true },
});

module.exports = mongoose.model('comments', CommentSchema);
