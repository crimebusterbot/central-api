const connection = require('../../lib/connection');

function Db() {
    this.getAllFakeWebshops = async () => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('SELECT website.domainName, website.domainExtension, ledger.fakeScore, ledger.fakeWebshop, MAX(ledger.checked) as checked FROM ledger INNER JOIN website ON website.id = ledger.fakeWebshop where fakeScore > 0.5 and live = 1 group by fakeWebshop order by MAX(ledger.checked) DESC', (error, results) => {
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
        })
    };

    this.getTotalCount = async () => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('select count(id) as total from website', (error, results) => {
                    con.release();

                    if (error) {
                        reject(error);
                    } else {
                        resolve(results[0].total);
                    }
                });
            } catch (error) {
                reject(error);
            }
        })
    };

    this.getGoodCount = async () => {
        return new Promise(async (resolve, reject) => {
            let con;

            try {
                con = await connection.acquire();

                con.query('select count(id) as good from `webshop-good`', (error, results) => {
                    con.release();

                    if (error) {
                        reject(error);
                    } else {
                        resolve(results[0].good);
                    }
                });
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

                con.query('select count(id) as amount, date_format(added, \'%m-%Y\') as month from `website` group by year(added), month(added)', (error, results) => {
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