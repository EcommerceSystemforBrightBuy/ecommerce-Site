//Connecting Database and create an pool to optimise the use of it.
const { createPool } = require('mysql2');

const pool = createPool({
    port : process.env.DB_PORT,
    host : process.env.DB_HOST,
    database : process.env.DB_NAME,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    connectionLimit : 10,  //Allowing only 10 connection at a time to make connections.
    connectTimeout : 10000, //Maximumm time for establish a connection (10 sec).
    // ssl : {
    //     rejectUnauthorized : true //it only allow authorized connections
    // }
})

module.exports = pool.promise();