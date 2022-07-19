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

		const timestamp = new Date();
		var newPost = new Post({
			author: user.username,
			content: req.body.content,
			timestamp: timestamp.toLocaleDateString('en-US', {
				day: 'numeric',
				month: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
			}),
			comments: [],
			likes: [],
		});
		newPost.save(function (err) {
			if (err) {
				return next(err);
			}
		});
	});
});

router.get('/posts/:postId/like', verifyJWT, function (req, res, next) {
	Post.findById(req.params.postId).exec(function (err, post) {
		res.json(post.likes);
	});
});

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
				}
			});
		} else {
			var updatedPost = post;
			updatedPost.likes.push(req.decoded.username);
			Post.findByIdAndUpdate(req.params.postId, updatedPost, {}, function (err) {
				if (err) {
					return next(err);
				}
			});
		}
	});
});

module.exports = router;
