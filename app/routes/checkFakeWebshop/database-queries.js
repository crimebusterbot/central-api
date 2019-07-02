const mysql = require('mysql');
const connection = require('../../lib/connection');

function Db() {
    this.checkIfTrustedWebshop = async (domainName, domainExtension) => {
        return new Promise( async (resolve, reject ) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('SELECT domainName, domainExtension FROM `website` INNER JOIN `webshop-good` ON `webshop-good`.website = `website`.id WHERE `website`.domainName = ? AND `website`.domainExtension = ?', [domainName, domainExtension], (error, results) => {
                    con.release();

                    if(error) {
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

    this.checkIfFakeWebshopExists = async (domainName, domainExtension) => {
        return new Promise( async (resolve, reject ) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('SELECT id, domainName, domainExtension FROM `website` WHERE domainName = ? AND domainExtension = ?', [domainName, domainExtension], (error, results) => {
                    con.release();

                    if(error) {
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

    this.addFakeWebshop = async (url, domainName, domainExtension, added) => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('INSERT INTO `website` SET url = ?, domainName = ?, domainExtension = ?, added = ?', [url, domainName, domainExtension, added], (error, results) => {
                    con.release();

                    if(error) {
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

    this.addNewNotFound = async (fakeWebshop, live, checked) => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('INSERT INTO `ledger` SET fakeWebshop = ?, live = ?, checked = ?', [fakeWebshop, live, checked], (error, results) => {
                    con.release();

                    if(error) {
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

    this.addNewLedger = async (webshopId, path, ipAddress, screenshotURL, checked, live, notFakeAnymore, fakeScore, score, certificateCheck, headers, statusCode) => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('INSERT INTO `ledger` SET fakeWebshop = ?, path = ?, ipAddress = ?, screenshotURL = ?, checked = ?, live = ?, notFakeAnymore = ?, fakeScore = ?, score= ?, certificateCheck = ?, headers = ?, statusCode = ?', [webshopId, path, ipAddress, screenshotURL, checked, live, notFakeAnymore, fakeScore, score, certificateCheck, headers, statusCode], (error, results) => {
                    con.release();

                    if(error) {
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

    this.getNameServer = async (domeinnaam) => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('SELECT ns0 FROM domains WHERE domeinnaam = ?', [domeinnaam], (error, results) => {
                    con.release();

                    if(error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    this.getDomains = async (nameserver) => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('SELECT domeinnaam FROM domains WHERE ns0 = ?', [nameserver[0].ns0], (error, results) => {
                    con.release();

                    if(error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                })
            } catch (error) {
                reject(error);
            }
        });
    }

    this.checkIfNameServerIsUsed = async (nameserver) => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('SELECT id FROM `checked-nameservers` WHERE nameserver = ?', [nameserver[0].ns0], (error, results) => {
                    con.release();

                    if(error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                })
            } catch (error) {
                reject(error);
            }
        });
    }

    this.insertNewNameServer = async (nameserver) => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('INSERT INTO `checked-nameservers` SET nameserver = ?, created = ?', [nameserver[0].ns0, new Date()], (error, results) => {
                    con.release();

                    if(error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                })
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new Db();