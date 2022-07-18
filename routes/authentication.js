var express = require('express');
var router = express.Router();
var User = require('../models/users');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

router.post('/register', function (req, res, next) {
	bcrypt.hash(req.body.password, 10, function (err, hashedPassword) {
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
			res.json({ error: 'User not found' });
		} else {
			bcrypt.compare(req.body.password, userInfo.password, function (err, result) {
				if (err) {
					return next(err);
				}
				if (result) {
					var token = jwt.sign({ userId: userInfo.id }, 'jwtSecret');
					res.json({ userInfo: userInfo, token });
				} else {
					res.json({ error: 'Incorrect password' });
				}
			});
		}
	});
});

module.exports = router;
