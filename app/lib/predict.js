const request = require('request');
const download = require('image-downloader');
const rp = require('request-promise-native');
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

function Prediction() {
    this.predict = async (website, res) => {
        if (website) {
            try {
                let screenshot = await requestScreenshot(res, website);
                let filename = await getImageAndSave(res, screenshot);
                let response = await sendPrediction(res, filename);
                await deleteFile(res, filename);

                return {success: true, prediction: response, imageLocation: screenshot.imageLocation, headers: screenshot.headerInformation, statusCode: screenshot.statusCode};
            } catch(error) {
                res.status(500);
                res.send(error);
            }
        } else {
            res.status(500);
            res.send({ success: false, message: 'There is no URL defined'});
        }
    }
}

async function requestScreenshot (res, url) {
    try {
        let encodedUrl = encodeURIComponent(url);
        let screenshot = await rp(`${process.env.SCREENSHOT_URL}/?u=${encodedUrl}`);

        return JSON.parse(screenshot);
    } catch (error) {
        throw({ success: false, message: 'Could not get screenshot'});
    }
}

async function getImageAndSave (res, screenshot) {
    const options = {
        url: screenshot.imageLocation,
        dest: './images'
    };

    try {
        const { filename } = await download.image(options);

        return filename;
    } catch (error) {
        throw({ success: false, message: 'We could not save screenshot to the disk of this server'});
    }
}

async function sendPrediction (res, filename) {
    let responseBody;

    try {
        // Doe de check op de ml service
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
                console.log(error);

                throw({success: false, message: 'We could not get a prediction from the ServeML service.'});
            } else {
                // Send back json from api
                try {
                    responseBody = JSON.parse(response.body);
                } catch (error) {
                    console.log(error);
                    throw({success: false, message: 'We could not get a prediction from the ServeML service.'});
                }
            }
        });

        return responseBody;
    } catch (error) {
        console.log(error);
    }
}

async function deleteFile (res, filename) {
    try {
        const remove = promisify(fs.unlink);
        await remove(filename);
    } catch (error) {
        throw({success: false, message: 'We could not clean up after the request.'});
    }
}

module.exports = new Prediction();