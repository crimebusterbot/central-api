/*
    The purpose of this file is to create CSV files that can then be easily loaded into a database.
    This code does not load the whole file in memory but goes through it line by line.
    This makes it possible to parse a multi gigabyte file.

    Do rename the .zone file to a .txt
*/

const csvWriter = require('csv-write-stream');
const lineread = require('line-by-line');
const fs = require('fs');

// Set the zonefile txt here
const lr = new lineread('zone.txt');
let body = [];
let tempJson = {};
let totalLines = 0;
let nscounter = 0;
let lastBlockName;
let counter = 0;
let originMarker = false;

let documentcounter = 0;

// Change the headers according to your database schema.
let writer = csvWriter({headers: ['domeinnaam', 'ds', 'rrsig', 'ns0', 'ns1', 'ns2', 'ns3']});
writer.pipe(fs.createWriteStream(`csv/zone-${documentcounter}.csv`));

lr.on('line', async (line) => {
    lr.pause();

    let tempArray = line.split(/\t/);

    // Begin of the domain block
    if(tempArray[0] !== '') {
        if (tempArray[0].includes('$ORIGIN') && originMarker !== true) {
            originMarker = true;

            if(totalLines > 0) {
                writer.write([tempJson.domeinnaam, tempJson.ds, tempJson.rrsig, tempJson.ns0, tempJson.ns1, tempJson.ns2, tempJson.ns3]);
            }
        } else if(tempArray[0].includes('$ORIGIN') && originMarker) {
            originMarker = false;
        } else if (originMarker) {
            // Do nothing
        } else {
            if(totalLines > 0) {
                if(counter === 0) {
                    await newCSVFile();
                }

                writer.write([tempJson.domeinnaam, tempJson.ds, tempJson.rrsig, tempJson.ns0, tempJson.ns1, tempJson.ns2, tempJson.ns3]);

                counter++;

                if(counter === 300000) {
                    await closeCSVFile();
                }
            }

            tempJson = {};

            // A domain can have n* ns servers
            nscounter = 0;

            let domeinNaamHandler = line.split(/\s+/);

            tempJson.domeinnaam = domeinNaamHandler[0];
            tempJson.ns0 = domeinNaamHandler[2];
        }

        // Adding extra blocks of information to last domain
    } else if(tempArray[3] !== '') {
        if(tempArray[3] === 'NS') {
            tempJson['ns' + nscounter] = tempArray[4];
            nscounter++;
        } else if(tempArray[3] === 'DS'){
            lastBlockName = 'ds';
            tempJson.ds = tempArray[4];
        } else if(tempArray[3] === 'RRSIG'){
            lastBlockName = 'rrsig';
            tempJson.rrsig = tempArray[4];
        }
        // Appending extra block of info to ds or rrsig block
    } else if (tempArray[4] !== '') {
        tempJson[lastBlockName] = tempJson[lastBlockName] + tempArray[4];
    }

    totalLines++;

    lr.resume();
});

lr.on('end', async () => {
    console.log(totalLines + ' lines added to storage');
    writer.end();
});

let newCSVFile = async () => {
    return new Promise((resolve) => {
        writer = csvWriter({headers: ['domeinnaam', 'ds', 'rrsig', 'ns0', 'ns1', 'ns2', 'ns3']});
        writer.pipe(fs.createWriteStream(`csv/zone-${documentcounter}.csv`));

        console.log('New file');
        resolve(writer);
    })
};

let closeCSVFile = async () => {
    return new Promise((resolve) => {
        console.log('300000 lines written');
        counter = 0;
        documentcounter++;
        writer.end();

        console.log('Closing file');
        resolve();
    })
};