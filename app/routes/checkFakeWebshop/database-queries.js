const mysql = require('mysql');
const connection = require('../../lib/connection');

function Db() {
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

    this.addNewLedger = async (webshopId, ipAddress, screenshotURL, checked, live, notFakeAnymore, fakeScore, certificateCheck, headers, statusCode) => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('INSERT INTO `ledger` SET fakeWebshop = ?, ipAddress = ?, screenshotURL = ?, checked = ?, live = ?, notFakeAnymore = ?, fakeScore = ?, certificateCheck = ?, headers = ?, statusCode = ?', [webshopId, ipAddress, screenshotURL, checked, live, notFakeAnymore, fakeScore, certificateCheck, headers, statusCode], (error, results) => {
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
    }
}

module.exports = new Db();