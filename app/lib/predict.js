const request = require('request');
const download = require('image-downloader');
const rp = require('request-promise-native');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

function Prediction() {
    this.predict = async (website) => {
        if (website) {
            try {
                let screenshot = await requestScreenshot(website);
                let filename = await getImageAndSave(screenshot);
                let response = await sendPrediction(filename);
                await deleteFile(filename);

                return {success: true, prediction: response, imageLocation: screenshot.imageLocation, headers: screenshot.headerInformation, statusCode: screenshot.statusCode};
            } catch(error) {
                throw(error);
            }
        } else {
            throw{ success: false, message: 'There is no URL defined'};
        }
    }
}

async function requestScreenshot (url) {
    return new Promise(async (resolve, reject) => {
        try {
            logger.log('Getting a screenshot');
            let encodedUrl = encodeURIComponent(url);
            let screenshot = await rp(`${process.env.SCREENSHOT_URL}/?u=${encodedUrl}`);

            resolve(JSON.parse(screenshot));
        } catch (error) {
            reject({ success: false, message: 'Could not get screenshot'});
        }
    });
}

async function getImageAndSave (screenshot) {
    return new Promise(async (resolve, reject) => {
        const options = {
            url: screenshot.imageLocation,
            dest: './images'
        };

        try {
            logger.log('Downloading screenshot');
            const { filename } = await download.image(options);

            resolve(filename);
        } catch (error) {
            reject({ success: false, message: 'We could not save screenshot to the disk of this server'});
        }        
    });
}

async function sendPrediction (filename) {
    return new Promise(async (resolve, reject) => {
        let responseBody;

        try {
            logger.log('Sending screenshot to serve ml service.');
            
            await rp({
                url: process.env.SERVE_URL,
                headers: {
                    'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
                },
                cache: false,
                contentType: false,
                processData: false,
                async: true,
                method: 'POST',
                formData: {
                    file: {
                        value: fs.createReadStream(filename),
                        options: {
                            filename: filename,
                            contentType: null
                        }
                    }
                }
            }, (error, response) => {
                if (error) {
                    reject({success: false, message: 'We could not get a prediction from the ServeML service.'});
                } else {
                    // Send back json from api
                    try {
                        responseBody = JSON.parse(response.body);
                    } catch (error) {
                        reject({success: false, message: 'We could not get a prediction from the ServeML service.'});
                    }
                }
            });

            resolve(responseBody);
        } catch (error) {
            reject({success: false, message: 'Serve ML threw a fit'});
        }
    });
}

async function deleteFile (filename) {
    return new Promise(async (resolve, reject) => {
        try {
            logger.log('Deleting local screenshot image');
            const remove = promisify(fs.unlink);
            await remove(filename);
            resolve();
        } catch (error) {
            reject({success: false, message: 'We could not clean up after the request.'});
        }
    });
}

module.exports = new Prediction();