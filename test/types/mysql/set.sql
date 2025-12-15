SET @var = 1;
SET @var1 = 1, @var2 = 2;
SET @@global.max_connections = 1000;
SET @@session.sql_mode = 'STRICT_TRANS_TABLES';
SET @var = (SELECT COUNT(*) FROM users);
SET @var := 1;
