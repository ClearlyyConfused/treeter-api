require('dotenv').config();
var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Post = require('../models/posts');
var jwt = require('jsonwebtoken');
var cloudinary = require('cloudinary').v2;

cloudinary.config({
	cloud_name: 'dotw5mwkx',
	api_key: '834972685861843',
	api_secret: process.env.CLOUDINARY,
});

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

// upload PFP
router.post('/updateProfilePicture', verifyJWT, function (req, res, next) {
	async function uploadImage() {
		return await cloudinary.uploader.upload(req.body.image);
	}

	User.findById(req.decoded.userId).exec(function (err, user) {
		uploadImage()
			.then((image) => {
				if (err) {
					return next(err);
				}

				var updatedUser = new User({
					_id: user._id,
					username: user.username,
					password: user.password,
					profilePicture: image.secure_url,
				});

				User.findByIdAndUpdate(req.decoded.userId, updatedUser, {}, function (err) {
					if (err) {
						return next(err);
					} else {
						res.json({ success: true });
					}
				});
			})
			.catch((err) => {
				console.log(err);
			});
	});
});

// get user's PFP
router.post('/getProfilePicture', verifyJWT, function (req, res, next) {
	User.findById(req.body.userID).exec(function (err, user) {
		res.json({ profilePicture: user.profilePicture });
	});
});

// Get posts
router.get('/posts', verifyJWT, function (req, res, next) {
	Post.find().exec(function (err, posts) {
		if (err) {
			return next(err);
		}
		res.json(posts);
	});
});

// create post
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
			views: 0,
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

// view post
router.post('/posts/:postId/view', verifyJWT, function (req, res, next) {
	Post.findById(req.params.postId).exec(function (err, post) {
		var updatedPost = new Post({
			_id: post._id,
			author: post.author,
			content: req.body.content,
			timestamp: req.body.timestamp,
			comments: post.comments,
			likes: post.likes,
			views: post.views + 1,
			updated: post.updated,
		});
		Post.findByIdAndUpdate(req.params.postId, updatedPost, {}, function (err) {
			if (err) {
				return next(err);
			} else {
				res.json({ success: true });
			}
		});
	});
});

// Update posts
router.post('/posts/:postId/update', verifyJWT, function (req, res, next) {
	Post.findById(req.params.postId).exec(function (err, post) {
		if (post.author === req.decoded.username) {
			var updatedPost = new Post({
				_id: post._id,
				author: post.author,
				content: req.body.content,
				timestamp: req.body.timestamp,
				comments: post.comments,
				likes: post.likes,
				views: post.views,
				updated: true,
			});
			Post.findByIdAndUpdate(req.params.postId, updatedPost, {}, function (err) {
				if (err) {
					return next(err);
				} else {
					res.json({ success: true });
				}
			});
		} else {
			res.json({ error: "Cannot update other people's posts" });
		}
	});
});

// Delete posts
router.post('/posts/:postId/delete', verifyJWT, function (req, res, next) {
	Post.findById(req.params.postId).exec(function (err, post) {
		if (post.author === req.decoded.username) {
			Post.findByIdAndDelete(req.params.postId, function (err) {
				if (err) {
					return next(err);
				} else {
					res.json({ success: true });
				}
			});
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

// Update Comments
router.post('/posts/:postId/comment/update', verifyJWT, function (req, res, next) {
	Post.findById(req.params.postId).exec(function (err, post) {
		if (err) {
			return next(err);
		}
		var newPost = post;
		function getComment(comment) {
			if (
				comment.author === req.body.comment.author &&
				comment.content === req.body.comment.content &&
				comment.timestamp === req.body.comment.timestamp
			) {
				return true;
			} else {
				return false;
			}
		}
		var index = newPost.comments.findIndex(getComment);

		if (newPost.comments[index].author === req.decoded.username) {
			newPost.comments.splice(index, 1);
			var updatedComment = {
				author: req.decoded.username,
				content: req.body.content,
				timestamp: req.body.timestamp,
				updated: true,
			};
			newPost.comments.push(updatedComment);
			Post.findByIdAndUpdate(req.params.postId, newPost, {}, function (err) {
				if (err) {
					return next(err);
				} else {
					res.json({ success: true });
				}
			});
		} else {
			res.json({ error: "Cannot update other people's comments" });
		}
	});
});

// Delete Comments
router.post('/posts/:postId/comment/delete', verifyJWT, function (req, res, next) {
	Post.findById(req.params.postId).exec(function (err, post) {
		if (err) {
			return next(err);
		}
		var newPost = post;
		function getComment(comment) {
			if (
				comment.author === req.body.comment.author &&
				comment.content === req.body.comment.content &&
				comment.timestamp === req.body.comment.timestamp
			) {
				return true;
			} else {
				return false;
			}
		}
		var index = newPost.comments.findIndex(getComment);

		if (newPost.comments[index].author === req.decoded.username) {
			newPost.comments.splice(index, 1);
			Post.findByIdAndUpdate(req.params.postId, newPost, {}, function (err) {
				if (err) {
					return next(err);
				} else {
					res.json({ success: true });
				}
			});
		} else {
			res.json({ error: "Cannot delete other people's comments" });
		}
	});
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
