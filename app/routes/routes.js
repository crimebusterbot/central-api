const express = require('express');
const router = express.Router();

const check = require('./checkFakeWebshop/check');

// Stel CORS in
router.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

router.post('/webshop/check', (req, res) => {
    check.check(req.body, res);
});

module.exports = router;