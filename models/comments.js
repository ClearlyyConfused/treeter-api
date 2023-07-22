var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	author: { type: String, required: true },
	content: { type: String },
	timestamp: { type: String, required: true },
	likes: { type: Array, required: true },
	views: { type: Number, required: true },
	updated: { type: Boolean },
	image: { type: String },
	replyChain: [{ type: Schema.Types.ObjectId }],
	comments: [{ type: Schema.Types.ObjectId, ref: 'Comments' }],
});

module.exports = mongoose.model('Comments', CommentSchema);
