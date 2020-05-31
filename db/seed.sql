INSERT INTO department (name)
VALUES 
('Sales'),
('IT'),
('HR');

INSERT INTO role (title, salary, department_id)
VALUES
("Manager", 40000, 1),
("Intern", 20000, 2),
("Engineer", 35000, 2),
("HR Manager", 40000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Jack', 'Wicik', 1, null),
('Grazyna', 'Boyle', 1, 1),
('Charles', 'Smith', 2, 1),
('Jon', 'Snow', 3, 1),
('Nirupama', 'Raman', 3, 2),
('Cersi', 'Lannister', 4, null);


