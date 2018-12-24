const mysql = require('mysql');
const {db_host, db_user, db_password, db_name} = require('../../config/database');

function Connection() {
    this.pool = null;

    this.init = function(){
        this.pool = mysql.createPool({
            connectionLimit: 20,
            host: db_host,
            user: db_user,
            password: db_password,
            database: db_name
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