const dns = require('dns');
const urlParser = require('url');
const TLDextract = require('tld-extract');
const domainSeperate = require('./domain');

function Extract() {
    this.domainInfo = async (url) => {
        try {
            let domain = urlParser.parse(url);
            let domainObj = {};

            domainObj.ipAddress = await this.getIP(domain);
            domainObj.notFound = domainObj.ipAddress === 0;
            domainObj.domainExtension = TLDextract(url).tld;
            domainObj.domainName = domainSeperate.base(url);

            return domainObj;
        } catch(error) {
            console.log(error);
        }
    };

    this.getIP = (domain) => {
        return new Promise((resolve, reject) => {
            dns.lookup(domain.hostname, (err, address) => {
                if(err && err.code === 'ENOTFOUND') {
                    resolve(0);
                } else if(err) {
                    resolve(0);
                } else {
                    resolve(address);
                }
            });
        });
    }
}

module.exports = new Extract();