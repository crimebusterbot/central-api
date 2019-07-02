const connection = require('../../lib/connection');

function Db() {
    this.findWebsite = async (domainName, domainExtension) => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('SELECT id FROM `website` WHERE domainName = ? AND domainExtension = ?', [domainName, domainExtension], (error, results) => {
                    con.release();

                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    };

    this.findGoodWebshop = async (domainName, domainExtension) => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('SELECT domainName, domainExtension FROM `website` INNER JOIN `webshop-good` ON `webshop-good`.website = `website`.id WHERE `website`.domainName = ? AND `website`.domainExtension = ?', [domainName, domainExtension], (error, results) => {
                    con.release();

                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    };

    this.addWebsite = async (website) => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('INSERT INTO website SET ?', [website], (error, results) => {
                    con.release();

                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    };

    this.addGoodWebshop = async (webshop) => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('INSERT INTO `webshop-good` SET ?', [webshop], (error, results) => {
                    con.release();

                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    };
}

module.exports = new Db();