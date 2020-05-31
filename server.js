/*
    DEPENDENCIES
    ===========================================================================================================
*/

const mysql = require('mysql2');
const inquirer = require('inquirer');
require('dotenv').config();

/* 
    CONNECTION TO THE DB
    ============================================================================================================
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
                "Delete an Employee",
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

                case "Delete an Employee":
                    deleteEmployee(); //call the function to update the employee role
                    break;
              
                case "Exit":
                    connection.end(); //if choice is Exit then end the MySQL connection
                
            }
        });
}

/*
    function to show all the employees============================================================================
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
    function to show all the Roles================================================================================
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
    function to show all the Department============================================================================
*/ 
const showAllDepartments = () => {
    connection.query ('SELECT * FROM department', function(err,results){
      if(err) throw err;
      console.table(results);
    })
    //start();
};

/*
    function to add department======================================================================================
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
                let sql = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
                let params = [answer.title, answer.salary, id];
                console.log(params);
                connection.query(sql, params, (err,res) => {
                    if (err) throw err;
                    console.log(`You have successfully added this role: ${(params[0]).toUpperCase()}`);
                });
                //showAllRoles();
                start();
                
            });
        });
    });
}


/*
    function to add employee========================================================================================
*/ 
const addEmployee = () => {
    const sql = `SELECT title from role;`;
    connection.query(sql, (err, res) => {
        if (err) throw err;
        const title = [];
        for(j=0; j< res.length; j++) {
            title.push(res[j].title)
        }

        connection.query("SELECT first_name, last_name from employee", (err,res)=>{
            var managerName = ['none'];
            if (err) throw err;

            for(k=0; k < res.length; k++) {
                var first_name = res[k].first_name;
                var last_name = res[k].last_name;
                console.table(first_name + last_name);
                managerName.push(first_name + " " + last_name);
            }
            console.table(managerName);
            console.table(title);
            inquirer
            .prompt([
                
                     {
                        type: "input",
                        name: "firstName",
                        message: "What is the employee's first name?",
                        validate: addEmployeeName => {
                            if(addEmployeeName.match("[a-zA-Z]+$")) {
                                return true;
                            } else {
                                console.log("Employee name has to be a a string! Please try again");
                                return false;
                            }
                        }
                    },
                    {
                        type: "input",
                        name: "lastName",
                        message: "What is the employee's last name?",
                        validate: addEmployeeLName => {
                            if(addEmployeeLName.match("[a-zA-Z]+$")) {
                                return true;
                            } else {
                                console.log("Employee's last name has to be a a string! Please try again");
                                return false;
                            }

                        }
                    },

                    {
                        type: "list",
                        name: "title",
                        message: "What is this employee's role?",
                        choices: title

                    },
                    {
                        type: "list",
                        name: "manager",
                        message: "Who is this employee's manager?",
                        choices: managerName
                    }
                
            ])
            .then(({ firstName, lastName, title, manager }) => {
                //console.table(manager);
                const sql1 = `SELECT id from role where title = ?`;
                const params1 = [title];
                connection.query(sql1, params1, (err, res)=> {
                    if(err) throw err;

                    var roleId = res[0].id;
                    var managerId;
                    if(manager === 'none'){
                        managerId = null;
                        const sql2 = `INSERT INTO employee(first_name, last_name, role_id, manager_id) values(?, ?, ?, ?)`;
                        const params2 = [firstName, lastName, title, manager];
                        connection.query(sql2, params2, (err,res)=> {
                            if (err) throw err;
                            console.table(res);
                            //call the start() function to start the first set of questions again
                            start();
                        })
                    }
                    else {
                        var managersName = manager.split(" ");
                        const sql3 = `SELECT id FROM employee where (first_name = ? and last_name = ?)`;
                        const params3 = [managersName[0], managersName[1]];
                        connection.query(sql3, params3, (err,res) => {
                            if (err) throw err;
                            console.table(res[0].id)
                            managerId = res[0].id;
                            // console.table(firstName);
                            // console.table(lastName);
                            // console.table(roleId);
                            // console.table(managerId);

                            const sql4 = "Insert into employee(first_name, last_name, role_id, manager_id) values(?, ?, ?, ?)";
                            const params4 = [firstName, lastName, roleId, managerId];
                            connection.query(sql4, params4, function (err, res) {
                                if (err) throw err;
                                //console.table(res);
                                console.log(`Successfull added the employee ${firstName} ${lastName}`);

                                //
                                start();
                            });
                        });
                    }
            
                });
            });
        });
    });
}

/*
    function to update the role of an employee=========================================================================
*/ 
const updateRole = () => {
    const sql5 = `SELECT title from role`;
    connection.query(sql5, (err, res) => {
        if(err) throw err;

        var role = [];
        var employeeUpdate = [];
        for(i = 0; i < res.length; i++){
            role.push(res[i].title);
        }

        const sql6 = `SELECT first_name, last_name from employee`;
        connection.query(sql6, (err,res) => {
            if(err) throw err;

            for(k = 0; k < res.length; k++){
                var first_name = res[k].first_name;
                var last_name = res[k].last_name;
                employeeUpdate.push(first_name + " " + last_name);
            }

            inquirer
            .prompt([
                {
                    name: "pickEmployee",
                    type: "list",
                    message: "Which employee do you want to update?",
                    choices: employeeUpdate

                },

                {
                    name: "newRole",
                    type: "list",
                    message: "Choose a role for this employee",
                    choices: role

                },

            ])
            .then(({ pickEmployee, newRole })=> {
                const sql7 = `SELECT id from role where title = ?`
                const params7 = [newRole];

                connection.query(sql7, params7, (err,res)=> {
                    if(err) throw err;
                    var roleId = res[0].id;
                    var name = pickEmployee.split(" ");

                    const sql8 = `UPDATE employee set role_id = ? WHERE first_name = ? and last_name = ?`;
                    const params8 = [roleId, name[0], name[1]];

                    connection.query(sql8, params8, (err, res)=>{
                        if(err) throw err;
                        console.log(`Employee Role has been updated to ${newRole}`);
                    })
                })

            })

        })
        
    })
}

/*
    function to delete an employee==================================================================================
*/

const deleteEmployee = () => {
    const sql9 = `SELECT first_name, last_name from employee`;
    connection.query(sql9, (err, res) => {
        var name = [];
        if (err) throw err;

        for (k = 0; k < res.length; k++) {
            var firstname = res[k].first_name;
            var lastname = res[k].last_name
            console.table(firstname + lastname)
            name.push(firstname + " " + lastname)
        }
        inquirer
        .prompt([
            {
                type: "list",
                name: "employee",
                message: "Select the employee you would like to delete",
                choices: name
            }
        ])
        .then(( {employee} )=>{
            var selectEmp = employee.split(" ");
            const sql10 = `SELECT id from employee where (first_name = ? and last_name = ?)`;
            const params10 = [selectEmp[0], selectEmp[1]];

            connection.query(sql10, params10, (err,res) => {
                if(err) throw err;
                console.table(res[0].id);
                const sql11 = `DELETE from employee where id = ?; `;
                const params11 = [res[0].id];
                connection.query(sql11, params11, (err,res) => {
                    console.log(`Employee : ${employee} has been deleted!`);
                    start();
                });
            });
        });
        
    });
}

