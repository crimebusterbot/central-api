// BASE SETUP

// call the packages we need
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const apiKeyCheck = require('./app/middleware/api-key-check');

let port = process.env.PORT || 8081;

const routes = require('./app/routes/routes');
const connection = require('./app/lib/connection');

// configure bodyParser
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Disable standard Express header for security purposes
app.disable('x-powered-by');

connection.init();

// Maak de routes aan en zorg dat ze reageren op /api/v1
app.use('/v1', apiKeyCheck.apiKey, routes);

const server = app.listen(port, function() {
    console.log( 'Server listening on port ' + server.address().port );
});

module.exports = app;