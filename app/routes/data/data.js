const db = require('./database-queries');

function Data () {
    this.totalWebshops = async (req, res) => {
        try {
            const total = await db.getTotalCount();
            const good = await db.getGoodCount();

            res.status(200);
            res.send({success: true, total: total, good: good, fake: total - good});
        } catch (error) {
            res.status(401);
            res.send({success: false, message: 'Something went wrong trying to get the total number of webshops.'});
        }
    };

    this.totalWebshopsInTime = async (req, res) => {
        try {
            const months = await db.getTotalInTime();

            res.status(200);
            res.send({success: true, count: months});
        } catch (error) {
            res.status(401);
            res.send({success: false, message: 'Something went wrong trying to get the total number of webshops.'});
        }
    }
}

module.exports = new Data();
