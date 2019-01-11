const extract = require('../../lib/extract');
const predict = require('../../lib/predict');
const db = require('./database-queries');
const rp = require('request-promise-native');

function Check() {
    this.check = async (req, res) => {
        // Check of deze fake webshop al in de db zit
        let webshopId;
        let newWebshop;

        try {
            if(!req.url) throw({success: false, message: 'No URL'});

            let domainInfo = await extract.domainInfo(req.url);
            let webshopExists = await checkIfExists(domainInfo.domainName, domainInfo.domainExtension);

            if(webshopExists.length === 0 && !domainInfo.notFound) {
                newWebshop = true;

                // We maken een nieuwe webshop.
                let webshop = await insertNewWebshop(req.url, domainInfo.domainName, domainInfo.domainExtension);
                webshopId = webshop.insertId;
            } else if (webshopExists.length > 0 && domainInfo.notFound) {
                db.addNewNotFound(webshopExists[0].id, false, new Date());

                res.status(200);
                res.send({success: true, notFound: true, message: `${req.url} was added to the ledger`});
                return;
            } else if (webshopExists.length > 0) {
                newWebshop = false;
                webshopId = webshopExists[0].id;
            } else {
                throw({success: false, message: 'We don\'t want to save non working websites if they weren\'t saved before.'});
            }

            // Doe een check met machine learning
            let mlInfo = await predict.predict(req.url, res);
            // TODO Doe een check op certificaat

            await addNewLedger(webshopId, domainInfo.ipAddress, mlInfo.imageLocation, new Date(), true, mlInfo.prediction.fake < 0.5, mlInfo.prediction.fake, '', mlInfo.headers, mlInfo.statusCode);

            res.status(200);
            res.send({
                success: true,
                new: newWebshop,
                message: `${req.url} was added to the ledger`,
                score: mlInfo.prediction,
                screenshot: mlInfo.imageLocation
            });

        } catch(error) {
            res.status(500);
            res.send(error);
        }
    }
}

async function checkIfExists(domainName, domainExtension) {
    try {
        let results = await db.checkIfFakeWebshopExists(domainName, domainExtension);

        return results;
    } catch(error) {
        throw({ success: false, message: 'Could not get check if webshop exists.', error: error});
    }
}

async function addNewLedger(webshopId, ipAddress, screenshotURL, checked, live, notFakeAnymore, fakeScore, certificateCheck, headers, statusCode) {
    try {
        let results = await db.addNewLedger(webshopId, ipAddress, screenshotURL, checked, live, notFakeAnymore, fakeScore, certificateCheck, JSON.stringify(headers), statusCode);

        return results;
    } catch(error) {
        throw({ success: false, message: 'Could not insert webshop ledger.', error: error});
    }
}

async function insertNewWebshop(url, domainName, domainExtension) {
    try {
        let results = await db.addFakeWebshop(url, domainName, domainExtension, new Date());

        return results;
    } catch(error) {
        throw({ success: false, message: 'Could not get check if webshop exists.'});
    }
}

module.exports = new Check();