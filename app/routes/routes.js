const express = require('express');
const router = express.Router();

const jwtAuth = require('../middleware/jwt-token-check');
const check = require('./checkFakeWebshop/check');
const auth = require('./authenticateUser/authenticate-user');

// Stel CORS in
router.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Unauthenticated routes
router.post('/user/auth', (req, res) => {
    auth.authenticate(req.body.username, req.body.password, res);
});


// Authicated routes
router.post('/webshop/check', jwtAuth.check, (req, res) => {
    check.check(req.body, res);
});

module.exports = router;