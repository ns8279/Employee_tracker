/*
    DEPENDENCIES
    =====================================================================
*/

const mysql = require('mysql2');

/* 
    CONNECTION TO THE DB
    =====================================================================
*/
const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    //username of your MySQL
    user: 'root',
    //password of your MySQL
    password: '',
    database: 'employee_trackerDB'
});

connection.connect(err => {
    if(err) throw err;
    console.log('Connected as id: ' + connection.threadId);
    showAllEmployees();
    //showAllRoles();
    //showAllDepartments();
});

showAllEmployees = () => {
    connection.query ('SELECT * FROM employee', function(err,results){
      if(err) throw err;
      console.table(results);
    });

    connection.query ('SELECT * FROM role', function(err,results){
        if(err) throw err;
        console.table(results);
    });

    connection.query ('SELECT * FROM department', function(err,results){
        if(err) throw err;
        console.table(results);
    });
      
    connection.end();

};

// showAllRoles = () => {
//     connection.query ('SELECT * FROM role', function(err,results){
//       if(err) throw err;
//       console.table(results);
//     })
    
// };

// showAllDepartments = () => {
//     connection.query ('SELECT * FROM department', function(err,results){
//       if(err) throw err;
//       console.table(results);
//     })
    
//     connection.end();
// };



