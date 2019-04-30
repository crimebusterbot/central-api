const mysql = require('mysql');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { db_host, db_user, db_password, db_name } = require('../config/database');
const connection = mysql.createConnection({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_name
});

// Username to be made
const username = 'USERNAME';

// Password to use
const password = 'PASS';

bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
        // Store hash in your password DB.
        if (err) {
            console.log(err);
        } else {
            const user = {
                username: username,
                password: hash,
                accountMade: new Date()
            };

            connection.query('insert into users SET ?', [user], function (error) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Account made')
                }
            });
        }
    });
});