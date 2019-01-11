const db = require('./database-queries');

function Data () {
    this.totalWebshops = async (req, res) => {
        try {
            const total = await db.getTotal();

            res.status(200);
            res.send({success: true, count: total[0].total});
        } catch (error) {
            res.status(401);
            res.send({success: false, message: 'Something went wrong trying to get the total number of webshops.'});
        }
    };

    this.totalWebshopsInTime = async (req, res) => {
        try {
            const total = await db.getTotalInTime();

            res.status(200);
            res.send({success: true, count: total});
        } catch (error) {
            res.status(401);
            res.send({success: false, message: 'Something went wrong trying to get the total number of webshops.'});
        }
    }
}

module.exports = new Data();
