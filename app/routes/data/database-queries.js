const mysql = require('mysql');
const connection = require('../../lib/connection');

function Db() {
    this.getTotal = async () => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('select count(id) as total from website', (error, results) => {
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

    this.getTotalInTime = async () => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('select count(id) as total, DATE(added) as added from website group by DATE(added)', (error, results) => {
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
}

module.exports = new Db();