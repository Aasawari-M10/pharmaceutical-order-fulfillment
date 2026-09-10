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
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log("Connected to Azure SQL");
        return pool;
    })
    .catch(err => {
        console.error("Database Connection Failed:", err);
    });

module.exports = {
    sql,
    poolPromise
};
