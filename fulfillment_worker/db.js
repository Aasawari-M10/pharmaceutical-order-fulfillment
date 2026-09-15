const sql = require("mssql");

require("dotenv").config();

const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,

    options: {
        encrypt: true,
        trustServerCertificate: false
    },

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const poolPromise =
    new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log(
                "Fulfillment Worker connected to Azure SQL"
            );

            return pool;
        });

module.exports = {
    sql,
    poolPromise
};
