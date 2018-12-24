const mysql = require('mysql');
const connection = require('../../lib/connection');

function Db() {
    this.findUser = async (username) => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('select id from users where username = ?', [username], (error, results) => {
                    con.release();

                    if (error) {
                        console.log(error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                })
            } catch (error) {
                reject(error);
            }
        })
    };

    this.getPassword = async (id) => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('select password from users where id = ?', [id], (error, results) => {
                    con.release();

                    if (error) {
                        console.log(error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                })
            } catch (error) {
                reject(error);
            }
        });
    };

    this.setWebtoken = async (token, id) => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('UPDATE users SET jwtToken = ?, lastLogin = ? WHERE id = ?', [token, new Date(), id], (error, results) => {
                    con.release();

                    if (error) {
                        console.log(error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                })
            } catch (error) {
                reject(error);
            }
        });
    };
}

module.exports = new Db();