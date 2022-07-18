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
		var newPost = new Post({
			author: user.username,
			content: req.body.content,
		});
		newPost.save(function (err) {
			if (err) {
				return next(err);
			}
		});
	});
});

module.exports = router;
