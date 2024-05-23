const jwtVariable = require('../variables/jwt');

const User = require('../models/user');

const authMethod = require('../methods/auth');

exports.isAuth = async (req, res, next) => {
	// Lấy access token từ header
	const accessTokenFromHeader = req.headers['authorization'];
	if (accessTokenFromHeader) {
		//token from bearer token
		const token = accessTokenFromHeader.split(' ')[1];
		if (!token) {
			return res.status(401).json({ message: 'Forbiden' });
		} else {
			const accessTokenSecret =
				process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;

			const verified = await authMethod.verifyToken(
				token,
				accessTokenSecret,
			);
			if (!verified) {
				return res.status(401).json({ message: 'unauthorized' });
			} else {
				req.user = verified.payload;

				return next();
			}
		}
	}
};
