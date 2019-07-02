const express = require('express');
const router = express.Router();
const logger = require('./../lib/logger');

const jwtAuth = require('../middleware/jwt-token-check');
const check = require('./checkFakeWebshop/check');
const auth = require('./authenticateUser/authenticate-user');
const data = require('./data/data');
const goodWebshop = require('./addGoodWebshop/addGoodWebshop');

// Setup CORS
router.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Unauthenticated routes
router.post('/user/auth', (req, res) => {
    logger.log('Route user/auth taken');
    auth.authenticate(req.body.username, req.body.password, res);
});

// Authicated routes
router.post('/webshop/check', jwtAuth.check, (req, res) => {
    logger.log('Route webshop/check taken');
    check.checkWebsite(req.body, res);
});

router.post('/webshop/add', jwtAuth.check, (req, res) => {
    logger.log('Route webshop/add taken');
    goodWebshop.add(req.body, res);
});

router.get('/data/total', jwtAuth.check, (req, res) => {
    logger.log('Route data/total taken');
    data.totalWebshops(req, res);
});

router.get('/data/graph', jwtAuth.check, (req, res) => {
    logger.log('Route data/graph taken');
    data.totalWebshopsInTime(req, res);
});

router.get('/data/fake', jwtAuth.check, (req, res) => {
    logger.log('Route data/fake taken');
    data.getAllFakeWebshops(req, res);
});

module.exports = router;