const {debug} = require('../../config/api');

function Logger() {
    this.log = (input) => {
        if(debug) {
            console.log(input);
        }
    }
}

module.exports = new Logger();