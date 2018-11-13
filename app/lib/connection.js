const mysql = require('mysql');
const variables = require('../../config/database');

function Connection() {
    this.pool = null;

    this.init = function(){
        this.pool = mysql.createPool({
            connectionLimit: 20,
            host: variables.db_host,
            user: variables.db_user,
            password: variables.db_password,
            database: variables.db_name
        });
    };

    this.acquire = async function(){
        let con;

        return new Promise((resolve, reject) => {
            this.pool.getConnection(function(error, connection) {
                if(error) {
                    reject(error);
                } else {
                    resolve(connection);
                }
            });
        });
    };
}

module.exports = new Connection();