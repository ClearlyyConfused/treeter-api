require('dotenv').config();
var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Post = require('../models/posts');
var Comment = require('../models/comments');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
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
	User.find({ username: req.body.username }).exec(function (err, user) {
		res.json({ profilePicture: user[0].profilePicture });
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
	async function uploadImage() {
		return await cloudinary.uploader.upload(req.body.image);
	}

	User.findById(req.decoded.userId).exec(function (err, user) {
		if (err) {
			return next(err);
		}
		if (req.body.image) {
			uploadImage().then((image) => {
				var newPost = new Post({
					author: user.username,
					content: req.body.content,
					timestamp: req.body.timestamp,
					comments: [],
					views: 0,
					likes: [],
					image: image.secure_url,
				});
				newPost.save(function (err) {
					if (err) {
						return next(err);
					} else {
						res.json({ success: true });
					}
				});
			});
		} else {
			var newPost = new Post({
				author: user.username,
				content: req.body.content,
				timestamp: req.body.timestamp,
				comments: [],
				views: 0,
				likes: [],
				image: undefined,
			});
			newPost.save(function (err) {
				if (err) {
					return next(err);
				} else {
					res.json({ success: true });
				}
			});
		}
	});
});

// view post
router.post('/posts/:postId/view', verifyJWT, function (req, res, next) {
	Post.findById(req.params.postId).exec(function (err, post) {
		if (post !== null) {
			var updatedPost = new Post({
				_id: post._id,
				author: post.author,
				content: post.content,
				timestamp: post.timestamp,
				comments: post.comments,
				likes: post.likes,
				image: post.image,
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
		} else {
			Comment.findById(req.params.postId).exec(function (err, comment) {
				var updatedComment = new Comment({
					_id: comment._id,
					author: comment.author,
					content: comment.content,
					timestamp: comment.timestamp,
					replyChain: comment.replyChain,
					comments: comment.comments,
					likes: comment.likes,
					image: comment.image,
					views: comment.views + 1,
					updated: comment.updated,
				});
				Comment.findByIdAndUpdate(req.params.postId, updatedComment, {}, function (err) {
					if (err) {
						return next(err);
					} else {
						res.json({ success: true });
					}
				});
			});
		}
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
		if (post !== null) {
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
		} else {
			Comment.findById(req.params.postId).exec(function (err, comment) {
				if (err) {
					return next(err);
				}
				if (comment.likes.includes(req.decoded.username)) {
					var index = comment.likes.indexOf(req.decoded.username);
					var updatedComment = comment;
					updatedComment.likes.splice(index, 1);
					Comment.findByIdAndUpdate(req.params.postId, updatedComment, {}, function (err) {
						if (err) {
							return next(err);
						} else {
							res.json({ success: true });
						}
					});
				} else {
					var updatedComment = comment;
					updatedComment.likes.push(req.decoded.username);
					Comment.findByIdAndUpdate(req.params.postId, updatedComment, {}, function (err) {
						if (err) {
							return next(err);
						} else {
							res.json({ success: true });
						}
					});
				}
			});
		}
	});
});

// Comment on post
router.post('/posts/:postId/comment', verifyJWT, function (req, res, next) {
	async function uploadImage() {
		if (req.body.image) {
			return await cloudinary.uploader.upload(req.body.image);
		} else {
			return undefined;
		}
	}

	Post.findById(req.params.postId).exec(function (err, post) {
		if (post !== null) {
			uploadImage().then((image) => {
				var newPost = post;

				var newComment = new Comment({
					author: req.decoded.username,
					content: req.body.content,
					timestamp: req.body.timestamp,
					image: image ? image.secure_url : undefined,
					likes: [],
					views: 0,
					updated: false,
					replyChain: [newPost._id],
					comments: [],
				});

				newPost.comments.push(newComment._id);
				Post.findByIdAndUpdate(req.params.postId, newPost, {}, function (err) {
					if (err) {
						return next(err);
					} else {
						newComment.save(function (err) {
							if (err) {
								return next(err);
							} else {
								res.json({ success: true });
							}
						});
					}
				});
			});
		} else {
			uploadImage().then((image) => {
				Comment.findById(req.params.postId).exec(function (err, comment) {
					if (err) {
						return next(err);
					}

					var updatedComment = comment;

					var newComment = new Comment({
						author: req.decoded.username,
						content: req.body.content,
						timestamp: req.body.timestamp,
						image: image ? image.secure_url : undefined,
						likes: [],
						views: 0,
						updated: false,
						replyChain: [...comment.replyChain, comment._id],
						comments: [],
					});

					updatedComment.comments.push(newComment._id);
					Comment.findByIdAndUpdate(req.params.postId, updatedComment, {}, function (err) {
						if (err) {
							return next(err);
						} else {
							newComment.save(function (err) {
								if (err) {
									return next(err);
								} else {
									res.json({ success: true });
								}
							});
						}
					});
				});
			});
		}
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

// Get post or comment Info
router.get('/posts/:postId', verifyJWT, function (req, res, next) {
	Post.findById(req.params.postId).exec(function (err, post) {
		if (err) {
			return next(err);
		}

		if (post !== null) {
			res.json(post);
		} else {
			Comment.findById(req.params.postId).exec(function (err, comment) {
				if (err) {
					return next(err);
				}
				res.json(comment);
			});
		}
	});
});

// return post info from an array of IDs
router.post('/posts/array', verifyJWT, async function (req, res, next) {
	async function fetchData(postId) {
		let post = await Post.findById(postId);
		if (post !== null) {
			return post;
		} else {
			post = await Comment.findById(postId);
			return post;
		}
	}

	async function fetchAllComment(postCommentIds) {
		let array = [];
		for (const id of postCommentIds) {
			const data = await fetchData(id);
			array.push(data);
		}
		return array;
	}

	const array = await fetchAllComment(req.body.array);
	res.json(array);
});

module.exports = router;
