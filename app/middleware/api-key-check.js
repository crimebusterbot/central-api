const variables = require('../../config/api');

function apiKey(req, res, next) {

    // check header for token
    const apikey = req.headers['api-key'];

    // decode token
    if (apikey === variables.apiKey) {
        next();
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No secured.'
        });
    }
}

module.exports = {
    apiKey: apiKey
};