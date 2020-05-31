/*
    DEPENDENCIES
    =====================================================================
*/

const mysql = require('mysql2');
const inquirer = require('inquirer');
require('dotenv').config();

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
    password: process.env.MYSQL_PASSWORD,
    database: 'employee_trackerDB'
});

connection.connect(err => {
    if(err) throw err;
    console.log('Connected as id: ' + connection.threadId);
    console.log("*********************************************************\n");
    console.log("*                                                        *\n");
    console.log("*            WELCOME TO EMPLOYEE MANAGER                 *\n");
    console.log("*                                                        *\n");
    console.log("*********************************************************\n");

    //showAllEmployees();
    start();
});


/*
    This function will promt the questions to USER
*/

const start = () => {
   return inquirer
        .prompt({
            name: 'initialAction',
            type: 'list',
            message: 'What would you wish to do?',
            choices: [
                "View All the Departments",
                "view all the roles",
                "View all the employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Update the role of an employee",
                "View employees by department",
                "Exit"
            ]
        })
        .then(function(answer) {
            switch(answer.initialAction){
                case "View All the Departments":
                    showAllDepartments(); //call the function to show all the departments
                    start(); //This will start the inquirer promt questions again
                    break;
                
                case "view all the roles":
                    showAllRoles(); //call the function to show all the existing roles
                    start();
                    break;
                
                case "View all the employees": 
                    showAllEmployees(); //call the function to show all the employees
                    start();
                    break;
                
                case "Add a department":
                    addDepartment(); //call the function to add a department
                    //start();
                    break;
                
                case "Add a role":
                    addRole(); //call the function to add a role
                    //
                    //start();
                    break;

                case "Add an employee":
                    addEmployee(); //call the function add an employee
                    break;
                
                case "Update the role of an employee":
                    updateRole(); //call the function to update the employee role
                    break;
                
                case "Update employee manager":
                    updateRole(); //call the function to update the employee role
                    break;

                
                case "Exit":
                    connection.end(); //if choice is Exit then end the MySQL connection
                
            }
        });
}

/*
    function to show all the employees======================================================================
*/ 
const showAllEmployees = () => {
    const sql = 
    `SELECT e.id, 
                        e.first_name, 
                        e.last_name, 
                        role.title, 
                        department.name AS department, 
                        role.salary, 
                        CONCAT(e_manager.first_name, " ",  e_manager.last_name) AS manager 
                    FROM employee e 
                        LEFT JOIN employee e_manager ON e.manager_id = e_manager.id 
                        LEFT JOIN role ON e.role_id = role.id 
                        LEFT JOIN department ON role.department_id = department.id`

    connection.query (sql, function(err,res){
      if(err) throw err;
      for (i = 0; i< res.length; i++) {
          console.table(res[i]);
    }

    start();
    });   
};

/*
    function to show all the Roles==============================================================================
*/ 
const showAllRoles = () => {
    const sql = `SELECT *, department.name as Department FROM role
                 LEFT JOIN department ON role.department_id = department.id
                 ORDER BY title; `
    connection.query (sql, function(err,results){
      if(err) throw err;
      console.table(results);
    })
    start(); 
};

/*
    function to show all the Department==========================================================================
*/ 
const showAllDepartments = () => {
    connection.query ('SELECT * FROM department', function(err,results){
      if(err) throw err;
      console.table(results);
    })
    //start();
};

/*
    function to add department===================================================================================
*/ 
const addDepartment =  () => {
    inquirer
     .prompt({
         name: "addDepartment",
         type: "input",
         message: "What is the name of the new department?",
         //validate if the department name is a string input
         validate: addDepartmentInput => {
            if(addDepartmentInput.match("[a-zA-Z]+$")) {
                return true;
            } else {
                console.log("Department name has to be a a string! Please try again");
                return false;
            }
         }
     })
     .then((answer)=>{
        let sql = 'INSERT INTO department (name) VALUES( ? )';
        connection.query(sql, answer.addDepartment, function(err, results) {
            if (err) throw err;
            console.log(`The following department has been added: ${(answer.addDepartment).toUpperCase()}`)
        });
        //showAllDepartments();
     })
}
/*
    function to add role==============================================================================================
*/ 
const addRole = () => {
    const deptSQL = ` SELECT * FROM department;`
    //connection
    connection.query(deptSQL, (err,res)=> {
        if(err) throw err;
        //inquirer to get input from the user
        inquirer
         .prompt([{
             name: 'title',
             type: 'input',
             message: 'What is the title of the new role?',
             validate: roleTitle => {
                if(roleTitle.match("[a-zA-Z]+$")) {
                    return true;
                } else {
                    console.log("Title of a role has to be a a string! Please try again");
                    return false;
                }
             }

         },
         {
             name: 'salary',
             type: 'input',
             message: 'What is the salary of the new role?',
             validate: roleSalary => {
                 if(roleSalary.match("[0-9]+$")) {
                     return true;
                 } else {
                     console.log("Invalid Salary!");
                 }
             }
         },
         {
             name: 'departmentName',
             type: 'list',
             message: 'Which department does this role belong to?',
             choices: ()=> {
                 let choiceArray = [];
                 res.forEach(res => {
                     choiceArray.push(
                         res.name
                     );
                 })
                 return choiceArray;
             }
         }

        ])
        .then((answer)=> {
            const department = answer.departmentName;
            connection.query(`SELECT * FROM department`, (err, res) => {
                if(err) throw err;

                let departmentIte = res.filter((res) => {
                    return res.name == department;
                });
                let id = departmentIte[0].id;
                let sql = 'INSERT INTO role(title, salary, department_id) VALUES (? ? ?)';
                let params = [answer.title, answer.salary, id];
                console.log(params);
                connection.query(sql, params, (err,res) => {
                    if (err) throw err;
                    console.log(`You have successfully added this role: ${(params[0]).toUpperCase()}`);
                });
                //showAllRoles();
            });
        });
    });
}


/*
    function to add employee========================================================================================
*/ 
// const addEmployee = () => {
//     const sql = `SELECT title from role;`;
//     connection.query(sql, (err, res) => {
//         if (err) throw err;
//         const title = [];
//         for(j=0; j< res.length; j++) {
//             title.push(res[j].title)
//         }
//     })
// }

/*
    function to update the role of an employee
*/ 

