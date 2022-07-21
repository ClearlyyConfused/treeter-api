require('dotenv').config();
var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Post = require('../models/posts');
var jwt = require('jsonwebtoken');

var verifyJWT = function (req, res, next) {
	var token = req.headers['token'];
	if (!token) {
		res.json({ error: 'unauthorized' });
	} else {
		jwt.verify(token, process.env.JWTSECRET, function (err, decoded) {
			if (err) {
				return next(err);
			} else {
				req.decoded = decoded;
				next();
			}
		});
	}
};

// Get/Post posts
router.get('/posts', verifyJWT, function (req, res, next) {
	Post.find().exec(function (err, posts) {
		if (err) {
			return next(err);
		}
		res.json(posts);
	});
});

router.post('/posts', verifyJWT, function (req, res, next) {
	User.findById(req.decoded.userId).exec(function (err, user) {
		if (err) {
			return next(err);
		}
		var newPost = new Post({
			author: user.username,
			content: req.body.content,
			timestamp: req.body.timestamp,
			comments: [],
			likes: [],
		});
		newPost.save(function (err) {
			if (err) {
				return next(err);
			} else {
				res.json({ success: true });
			}
		});
	});
});

// Delete posts
router.post('/posts/:postId/delete', verifyJWT, function (req, res, next) {
	Post.findById(req.params.postId).exec(function (err, post) {
		if (post.author === req.decoded.username) {
			Post.findByIdAndDelete(req.params.postId, function (err) {
				if (err) {
					return next(err);
				}
			});
			res.json({ success: true });
		} else {
			res.json({ error: "Cannot delete other people's posts" });
		}
	});
});

// Post Likes
router.post('/posts/:postId/like', verifyJWT, function (req, res, next) {
	Post.findById(req.params.postId).exec(function (err, post) {
		if (err) {
			return next(err);
		}
		if (post.likes.includes(req.decoded.username)) {
			var index = post.likes.indexOf(req.decoded.username);
			var updatedPost = post;
			updatedPost.likes.splice(index, 1);
			Post.findByIdAndUpdate(req.params.postId, updatedPost, {}, function (err) {
				if (err) {
					return next(err);
				} else {
					res.json({ success: true });
				}
			});
		} else {
			var updatedPost = post;
			updatedPost.likes.push(req.decoded.username);
			Post.findByIdAndUpdate(req.params.postId, updatedPost, {}, function (err) {
				if (err) {
					return next(err);
				} else {
					res.json({ success: true });
				}
			});
		}
	});
});

// Post Comments
router.post('/posts/:postId/comment', verifyJWT, function (req, res, next) {
	Post.findById(req.params.postId).exec(function (err, post) {
		if (err) {
			return next(err);
		}
		var newPost = post;
		var newComment = {
			author: req.decoded.username,
			content: req.body.content,
			timestamp: req.body.timestamp,
		};
		newPost.comments.push(newComment);
		Post.findByIdAndUpdate(req.params.postId, newPost, {}, function (err) {
			if (err) {
				return next(err);
			} else {
				res.json({ success: true });
			}
		});
	});
});

// Delete Comments
router.post('/posts/:postId/comment/delete', verifyJWT, function (req, res, next) {
	res.send('ok');
});

// Get Specific Post Info
router.get('/posts/:postId', verifyJWT, function (req, res, next) {
	Post.findById(req.params.postId).exec(function (err, post) {
		if (err) {
			return next(err);
		}
		res.json(post);
	});
});

module.exports = router;
