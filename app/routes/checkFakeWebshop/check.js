const url = require('url');
const isUrl = require('is-url');
const extract = require('../../lib/extract');
const predict = require('../../lib/predict');
const logger = require('../../lib/logger');
const rp = require('request-promise-native');
const db = require('./database-queries');

function Check() {
    this.checkWebsite = async (req, res) => {
        // Check if this webshop is already in the database
        let webshopId;
        let newWebshop;

        try {
            // If there is no URL we can't run.
            if(!req.url) throw({success: false, message: 'No URL'});
            if(!isUrl(req.url)) throw({success: false, message: 'This does not seem to be a valid URL'});

            // Should we send this URL to the queue? If this call was already the result of a queue then no.
            // let sendToQueue = req.queue || false;

            // We need the different parts of the domain.
            let domainInfo = await extract.domainInfo(req.url);

            // The first thing we do is check if the URL is a known good webshop
            let goodWebshop = await checkIfTrustedWebshop(domainInfo.domainName, domainInfo.domainExtension);

            if (goodWebshop.length > 0) {
                res.status(200);
                res.send({success: true, notFound: false, trusted: true, message: `${req.url} is a trusted webshop`});
                return;
            }
            
            // Do a call to the database to see if we know this domain already.
            let webshopExists = await checkIfExists(domainInfo.domainName, domainInfo.domainExtension);

            // It is a new domain
            if(webshopExists.length === 0 && !domainInfo.notFound) {
                newWebshop = true;

                // We create a new webshop in the database.
                let webshop = await insertNewWebshop(req.url, domainInfo.domainName, domainInfo.domainExtension);
                webshopId = webshop.insertId;

                // We create a queue for the domain if it is .nl
                /*
                if(domainInfo.domainExtension === 'nl' && sendToQueue) {
                    logger.log('Adding ' + domainInfo.domainName + ' to the queue');
                    await addToQueue(domainInfo.domainName);
                }
                */
            // We might want to know if a known webshop is now down.
            } else if (webshopExists.length > 0 && domainInfo.notFound) {
                db.addNewNotFound(webshopExists[0].id, false, new Date());

                res.status(200);
                res.send({success: true, notFound: true, trusted: false, message: `${req.url} was added to the ledger`});
                return;
            // if a webshop exists we use its info.
            } else if (webshopExists.length > 0) {
                logger.log('Webshop exists already');
                newWebshop = false;
                webshopId = webshopExists[0].id;
            } else {
                throw({success: false, message: 'We don\'t want to save non working websites if they weren\'t saved before.'});
            }

            // Do a check with machine learning
            let mlInfo = await predict.predict(req.url, res);

            // TODO Add again when service is more stable
            // let cert = await checkCert(req.url);
            
            // We want to save the specific path we looked at.
            let urlFull = url.parse(req.url);
            let path = [urlFull.pathname, urlFull.query, urlFull.hash].join('');

            await addNewLedger(webshopId, path, domainInfo.ipAddress, mlInfo.imageLocation, new Date(), true, mlInfo.prediction.fake < 0.5, mlInfo.prediction.fake, JSON.stringify(mlInfo.prediction), '', mlInfo.headers, mlInfo.statusCode);

            res.status(200);
            res.send({
                success: true,
                new: newWebshop,
                trusted: false,
                message: `${req.url} was added to the ledger`,
                score: mlInfo.prediction,
                screenshot: mlInfo.imageLocation
            });
        } catch(error) {
            res.status(500);
            logger.log('It goes wrong here');
            res.send(error);
        }
    }
}

async function addToQueue(domain) {
    return new Promise(async (resolve, reject) => {
        try {
            logger.log('Adding list to queue.');
            let domains
            const nameserver = await db.getNameServer(domain);

            if (nameserver.length > 0) {
                // Check if we checked this nameserver already
                const checked = await db.checkIfNameServerIsUsed(nameserver);

                if(checked.length === 0) {
                    domains = await db.getDomains(nameserver);

                    if(domains.length > 0) {
                        const options = {
                            method: 'POST',
                            uri: `${process.env.QUEUE_URL}/api/v1/queuer`,
                            body: {
                                urls: domains.map((domain) => {
                                    return `http://${domain}.nl`
                                })
                            },
                            json: true
                        };
            
                        await rp(options);

                        // Add the checked nameserver to the db so it is only checked once.
                        await db.insertNewNameServer(nameserver);

                        resolve();
                    } else {
                        await db.insertNewNameServer(nameserver);

                        resolve();
                    }
                }
            } else {
                resolve();
            }
        } catch (error) {
            reject({success: false, message: 'Adding to queue did not work', error: error});
        }
    });
}

async function checkIfExists(domainName, domainExtension) {
    return new Promise(async (resolve, reject) => {
        try {
            logger.log('Checking if the webshop exists.');
            let results = await db.checkIfFakeWebshopExists(domainName, domainExtension);

            resolve(results);
        } catch(error) {
            reject({ success: false, message: 'Could not get check if webshop exists.', error: error});
        }
    });
}

async function checkIfTrustedWebshop(domainName, domainExtension) {
    return new Promise(async (resolve, reject) => {
        try {
            logger.log('Checking if the webshop is a known good webshop.');
            let results = await db.checkIfTrustedWebshop(domainName, domainExtension);

            resolve(results);
        } catch(error) {
            reject({ success: false, message: 'Could not get check if webshop is known good webshop.', error: error});
        }
    });
}

async function addNewLedger(webshopId, path, ipAddress, screenshotURL, checked, live, notFakeAnymore, fakeScore, score, certificateCheck, headers, statusCode) {
    return new Promise(async (resolve, reject) => {
        try {
            logger.log('Adding new ledger.');
            let results = await db.addNewLedger(webshopId, path, ipAddress, screenshotURL, checked, live, notFakeAnymore, fakeScore, score, certificateCheck, JSON.stringify(headers), statusCode);

            resolve(results);
        } catch(error) {
            reject({ success: false, message: 'Could not insert webshop ledger.', error: error});
        }
    });
}

async function insertNewWebshop(url, domainName, domainExtension) {
    return new Promise(async (resolve, reject) => {
        try {
            logger.log('Adding new webshop.');
            let results = await db.addFakeWebshop(url, domainName, domainExtension, new Date());

            resolve(results);
        } catch(error) {
            reject({ success: false, message: 'Could not get check if webshop exists.'});
        }
    });
}

module.exports = new Check();
