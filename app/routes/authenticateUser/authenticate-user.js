// Authorizatie code
const bcrypt = require('bcryptjs');
const db = require('./database-queries');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../../../config/jwt');

function User (){
    this.authenticate = async (username, givenPassword, res) => {
        if (username && givenPassword) {
            try {
                const userId = await findUser(username);
                await checkPassword(userId[0].id, givenPassword);
                const response = await generateAndSaveToken(username, userId[0].id);

                res.status(200);
                res.send(response);

            } catch (error) {
                res.status(401);
                res.send(error);
            }
        } else {
            res.status(401);
            res.send({ success: false, message: 'Either the username or password is missing.'});
        }
    }
}

async function findUser (username) {
    try {
        const userId = await db.findUser(username);

        if (Object.keys(userId).length > 0) {
            return userId;
        } else {
            throw({ success: false, message: 'This combination of this username and password was not found.'});
        }
    } catch (error) {
        throw( error );
    }
}

async function checkPassword (id, givenPassword) {
    try {
        const password = await db.getPassword(id);

        if (Object.keys(password).length > 0) {
            const match = await bcrypt.compare(givenPassword, password[0].password);

            if(match){
                return true;
            } else {
                throw({success: false, message: 'This combination of this username and password was not found.'});
            }
        } else {
            throw({success: false, message: 'The user with the given id is not in the system.'});
        }
    } catch (error) {
        throw( error );
    }
}

async function generateAndSaveToken (username, id) {
    try {
        const payload = {
            username: username
        };

        const token = jwt.sign(payload, jwtConfig.jwtSecret, {
            expiresIn: '14d'
        });

        const response = await db.setWebtoken(token, id);

        if (Object.keys(response).length > 0) {
            return {success: true, username: username, token: token};
        } else {
            throw({success: false, message: 'Something went wrong trying to set your token.'});
        }
    } catch (error) {
        throw( error );
    }
}

module.exports = new User();