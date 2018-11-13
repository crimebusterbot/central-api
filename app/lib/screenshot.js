const crypto = require("crypto");
const fs = require('fs');
const puppeteer = require('puppeteer');
const createPuppeteerPool = require('puppeteer-pool');

const domain = require('./domain');

// Returns a generic-pool instance that every function can use
const pool = createPuppeteerPool({
    max: 50,
    min: 1,
    // how long a resource can stay idle in pool before being removed
    idleTimeoutMillis: 30000, // default.
    // maximum number of times an individual resource can be reused before being destroyed; set to 0 to disable
    maxUses: 50, // default
    // function to validate an instance prior to use; see https://github.com/coopernurse/node-pool#createpool
    validator: () => Promise.resolve(true), // defaults to always resolving true
    // validate resource before borrowing; required for `maxUses and `validator`
    testOnBorrow: true, // default
    // For all opts, see opts at https://github.com/coopernurse/node-pool#createpool
    puppeteerArgs: []
});

function Screenshot() {
    this.take = (url, extension, destinationFolder) => {
        console.log('Start taking screenshot');
        return new Promise((resolve, reject) => {
            try {
                pool.use(async (browser) => {
                    const page = await browser.newPage();
                
                    let imageName = domain.base(url) + '-' + crypto.randomBytes(2).toString('hex');

                    await page.goto(url);
                    await page.screenshot({path: `${destinationFolder}/${imageName}.${extension}`, fullPage: true});
                    console.log('screenshot taken');
                    page.close();

                    resolve(imageName);
                });
            } catch(error) {
                reject(error);
            }
        });
    }
}

module.exports = new Screenshot();