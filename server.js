/*
    DEPENDENCIES
    ===============================================================
*/
const mysql = require('mysql2');

/* 
    CONNECTION TO THE DB
    ================================================================

*/
const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    //username of your MySQL
    user: 'root',
    //password of your MySQL
    password: 'Bhuvaneswari23',
    database: 'employee_trackerDB'
});

connection.connect(err => {
    if(err) throw err;
    console.log('Connected as id: ' + connection.threadId);
});
