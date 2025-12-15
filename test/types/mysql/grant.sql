GRANT SELECT ON mydb.* TO user1;
GRANT SELECT, INSERT ON mydb.* TO user1;
GRANT SELECT ON mydb.* TO user1@localhost;
GRANT SELECT ON mydb.* TO user1 WITH GRANT OPTION;
GRANT SELECT (id, name) ON mydb.users TO user1;
GRANT SELECT ON TABLE mydb.users TO user1;
GRANT SELECT ON mydb.users TO 'user1'@'localhost', 'user2'@'%';
