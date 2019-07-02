const extract = require('../../lib/extract');
const isUrl = require('is-url');
const logger = require('../../lib/logger');
const db = require('./database-queries');

function GoodWebshop() {
    this.add = async (req, res) => {
        try {    
            if (!req.url) throw({success: false, message: 'No URL'});
            if(!isUrl(req.url)) throw({success: false, message: 'This does not seem to be a valid URL'});


            const domain = await extract.domainInfo(req.url);            
            const exists = await checkIfGoodWebshopExists(domain);

            if(exists) {
                throw({success: false, message: 'This webshop is already in the database'});
            }

            let id;
            const websiteExists = await db.findWebsite(domain.domainName, domain.domainExtension);
            
            if (websiteExists.length === 0) {
                // Add website to db
                const website = {
                    url: req.url,
                    added: new Date(),
                    domainName: domain.domainName,
                    domainExtension: domain.domainExtension
                }

                const result = await db.addWebsite(website);
                id = result.insertId;
                
            } else {
                id = websiteExists[0].id;
            }

            // Add good-webshop to db
            await db.addGoodWebshop({
                website: id,
                email: req.email,
                vestigingsAdres: req.vestigingsAdres,
                postAdres: req.postAdres,
                telefoonNummer: req.telefoonNummer,
                bedrijfsNaam: req.bedrijfsNaam,
                kvkNummer: req.kvkNummer,
                btwNummer: req.btwNummer,
                contactPersoon: req.contactPersoon,
                added: new Date(),
                live: 1,
                keurmerkNaam: req.keurmerkNaam,
                keurmerkLidSinds: req.keurmerkLidSinds,
                categorie: req.categorie,
                naam: req.naam
            });

            res.status(200);
            res.send({success: true, message: 'Good webshop added to the database'});
        } catch (error) {
            res.status(500);
            res.send(error);
        }
    }
}

async function checkIfGoodWebshopExists(domain) {
    return new Promise(async (resolve, reject) => {
        try {
            logger.log('Checking if the webshop exists.');
            
            const results = await db.findGoodWebshop(domain.domainName, domain.domainExtension);

            if (results.length > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch(error) {
            reject({ success: false, message: 'Could not get check if webshop exists.', error: error});
        }
    });
}

module.exports = new GoodWebshop();