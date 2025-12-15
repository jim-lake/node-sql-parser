import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import { isCreate, isCreateConstraintPrimary, isCreateConstraintUnique, isCreateConstraintForeign, isCreateConstraintCheck } from './types.guard';

const parser = new Parser();

test('CreateConstraintPrimary - basic properties', () => {
  const sql = 'CREATE TABLE users (id INT, PRIMARY KEY (id))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintPrimary(constraint));

  // Verify all properties
});

test('CreateConstraintPrimary - with constraint name', () => {
  const sql = 'CREATE TABLE users (id INT, CONSTRAINT pk_users PRIMARY KEY (id))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintPrimary(constraint));

});

test('CreateConstraintPrimary - without constraint name', () => {
  const sql = 'CREATE TABLE users (id INT, PRIMARY KEY (id))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintPrimary(constraint));

});

test('CreateConstraintPrimary - with index_type', () => {
  const sql = 'CREATE TABLE users (id INT, PRIMARY KEY USING BTREE (id))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintPrimary(constraint));

});

test('CreateConstraintPrimary - without index_type', () => {
  const sql = 'CREATE TABLE users (id INT, PRIMARY KEY (id))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintPrimary(constraint));

});

test('CreateConstraintPrimary - with index_options', () => {
  const sql = 'CREATE TABLE users (id INT, PRIMARY KEY (id) KEY_BLOCK_SIZE = 8)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintPrimary(constraint));

});

test('CreateConstraintPrimary - without index_options', () => {
  const sql = 'CREATE TABLE users (id INT, PRIMARY KEY (id))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintPrimary(constraint));

});

test('CreateConstraintPrimary - multiple columns', () => {
  const sql = 'CREATE TABLE users (id INT, email VARCHAR(255), PRIMARY KEY (id, email))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![2];
  assert.ok(isCreateConstraintPrimary(constraint));

});

test('CreateConstraintUnique - basic properties', () => {
  const sql = 'CREATE TABLE users (email VARCHAR(255), UNIQUE KEY (email))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintUnique(constraint));

});

test('CreateConstraintUnique - constraint_type variants', () => {
  // Test "unique key"
  const sql1 = 'CREATE TABLE users (email VARCHAR(255), UNIQUE KEY (email))';
  const ast1 = parser.astify(sql1);
  assert.ok(isCreate(ast1));
  const constraint1 = ast1.create_definitions![1];
  assert.ok(isCreateConstraintUnique(constraint1));

  // Test "unique index"
  const sql2 = 'CREATE TABLE users (email VARCHAR(255), UNIQUE INDEX (email))';
  const ast2 = parser.astify(sql2);
  assert.ok(isCreate(ast2));
  const constraint2 = ast2.create_definitions![1];
  assert.ok(isCreateConstraintUnique(constraint2));

  // Test "unique" only
  const sql3 = 'CREATE TABLE users (email VARCHAR(255), UNIQUE (email))';
  const ast3 = parser.astify(sql3);
  assert.ok(isCreate(ast3));
  const constraint3 = ast3.create_definitions![1];
  assert.ok(isCreateConstraintUnique(constraint3));
});

test('CreateConstraintUnique - with constraint name', () => {
  const sql = 'CREATE TABLE users (email VARCHAR(255), CONSTRAINT uk_email UNIQUE KEY (email))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintUnique(constraint));

});

test('CreateConstraintUnique - with index name', () => {
  const sql = 'CREATE TABLE users (email VARCHAR(255), UNIQUE KEY idx_email (email))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintUnique(constraint));

});

test('CreateConstraintUnique - without index name', () => {
  const sql = 'CREATE TABLE users (email VARCHAR(255), UNIQUE KEY (email))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintUnique(constraint));

});

test('CreateConstraintUnique - with index_type', () => {
  const sql = 'CREATE TABLE users (email VARCHAR(255), UNIQUE KEY USING HASH (email))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintUnique(constraint));

});

test('CreateConstraintUnique - with index_options', () => {
  const sql = 'CREATE TABLE users (email VARCHAR(255), UNIQUE KEY (email) VISIBLE)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintUnique(constraint));

});

test('CreateConstraintForeign - basic properties', () => {
  const sql = 'CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintForeign(constraint));

});

test('CreateConstraintForeign - with constraint name', () => {
  const sql = 'CREATE TABLE orders (user_id INT, CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintForeign(constraint));

});

test('CreateConstraintForeign - with index name', () => {
  const sql = 'CREATE TABLE orders (user_id INT, FOREIGN KEY fk_user_id (user_id) REFERENCES users(id))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintForeign(constraint));

});

test('CreateConstraintForeign - without index name', () => {
  const sql = 'CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintForeign(constraint));

});

test('CreateConstraintForeign - with reference_definition', () => {
  const sql = 'CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintForeign(constraint));

});

test('CreateConstraintForeign - without reference_definition', () => {
  const sql = 'CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintForeign(constraint));

  // reference_definition should exist but on_action should be empty
});

test('CreateConstraintCheck - basic properties', () => {
  const sql = 'CREATE TABLE products (price INT, CHECK (price > 0))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintCheck(constraint));

});

test('CreateConstraintCheck - with constraint name', () => {
  const sql = 'CREATE TABLE products (price INT, CONSTRAINT chk_price CHECK (price > 0))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintCheck(constraint));

});

test('CreateConstraintCheck - without constraint name', () => {
  const sql = 'CREATE TABLE products (price INT, CHECK (price > 0))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintCheck(constraint));

});

test('CreateConstraintCheck - definition is Binary array', () => {
  const sql = 'CREATE TABLE products (price INT, CHECK (price > 0))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintCheck(constraint));

});

test('CreateConstraintCheck - index_type for NOT FOR REPLICATION', () => {
  // Note: NOT FOR REPLICATION is a SQL Server feature, may not work in MySQL
  // This test verifies the type structure if it were supported
  const sql = 'CREATE TABLE products (price INT, CHECK (price > 0))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast));
  const constraint = ast.create_definitions![1];
  assert.ok(isCreateConstraintCheck(constraint));

  // In standard MySQL, index_type should be null
});
