var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

var verifyJWT = function (req, res, next) {
	var token = req.headers['token'];

	if (!token) {
		res.json({ error: 'unauthorized' });
	} else {
		jwt.verify(token, 'jwtSecret', function (err, decoded) {
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
	res.json({ userInfo: req.decoded });
});

module.exports = router;
