require('dotenv').config();
var express = require('express');
var router = express.Router();
var User = require('../models/users');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

router.post('/register', function (req, res, next) {
	bcrypt.hash(req.body.password, 10, function (err, hashedPassword) {
		if (err) {
			return next(err);
		}
		var newUser = new User({
			username: req.body.username,
			password: hashedPassword,
		});
		newUser.save(function (err) {
			if (err) {
				return next(err);
			}
		});
	});
});

router.post('/login', function (req, res, next) {
	User.findOne({ username: req.body.username }).exec(function (err, userInfo) {
		if (err) {
			return next(err);
		}
		if (userInfo === null) {
			res.json({ error: 'Username not found' });
		} else {
			bcrypt.compare(req.body.password, userInfo.password, function (err, result) {
				if (err) {
					return next(err);
				}
				if (result) {
					var token = jwt.sign(
						{ userId: userInfo._id, username: userInfo.username },
						process.env.JWTSECRET
					);
					res.json({ token, userId: userInfo._id });
				} else {
					res.json({ error: 'Incorrect password' });
				}
			});
		}
	});
});

module.exports = router;
