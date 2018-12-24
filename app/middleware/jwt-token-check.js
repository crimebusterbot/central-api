const {jwtSecret} = require('../../config/jwt');
const jwt = require('jsonwebtoken');

function check(req, res, next) {
    // check header for token
    const token = req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, jwtSecret, function(err, decoded) {
            if (err) {
                return res.status(403).send({
                    success: false,
                    message: 'Failed to authenticate.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'Not secured.'
        });
    }
}

module.exports = {
    check: check
};