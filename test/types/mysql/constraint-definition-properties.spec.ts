import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import { isCreate, isCreateConstraintPrimary, isCreateConstraintUnique, isCreateConstraintForeign, isCreateConstraintCheck } from './types.guard';

const parser = new Parser();

test('CreateConstraintPrimary - all properties', async (t) => {
  await t.test('CreateConstraintPrimary - basic properties', () => {
    const sql = 'CREATE TABLE users (id INT, PRIMARY KEY (id))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintPrimary(constraint));
    
    // Verify all properties
    assert.strictEqual(constraint.constraint_type, 'primary key');
    assert.strictEqual(constraint.resource, 'constraint');
    assert.ok(Array.isArray(constraint.definition));
    assert.strictEqual(constraint.definition.length, 1);
    assert.strictEqual(constraint.definition[0].column, 'id');
  });

  await t.test('CreateConstraintPrimary - with constraint name', () => {
    const sql = 'CREATE TABLE users (id INT, CONSTRAINT pk_users PRIMARY KEY (id))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintPrimary(constraint));
    
    assert.strictEqual(constraint.constraint, 'pk_users');
    assert.strictEqual(constraint.keyword, 'constraint');
  });

  await t.test('CreateConstraintPrimary - without constraint name', () => {
    const sql = 'CREATE TABLE users (id INT, PRIMARY KEY (id))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintPrimary(constraint));
    
    assert.strictEqual(constraint.constraint, null);
    assert.strictEqual(constraint.keyword, null);
  });

  await t.test('CreateConstraintPrimary - with index_type', () => {
    const sql = 'CREATE TABLE users (id INT, PRIMARY KEY USING BTREE (id))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintPrimary(constraint));
    
    assert.ok(constraint.index_type);
    assert.strictEqual(constraint.index_type.keyword, 'using');
    assert.strictEqual(constraint.index_type.type, 'btree');
  });

  await t.test('CreateConstraintPrimary - without index_type', () => {
    const sql = 'CREATE TABLE users (id INT, PRIMARY KEY (id))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintPrimary(constraint));
    
    assert.strictEqual(constraint.index_type, null);
  });

  await t.test('CreateConstraintPrimary - with index_options', () => {
    const sql = 'CREATE TABLE users (id INT, PRIMARY KEY (id) KEY_BLOCK_SIZE = 8)';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintPrimary(constraint));
    
    assert.ok(constraint.index_options);
    assert.strictEqual(constraint.index_options.length, 1);
    assert.strictEqual(constraint.index_options[0].type, 'key_block_size');
  });

  await t.test('CreateConstraintPrimary - without index_options', () => {
    const sql = 'CREATE TABLE users (id INT, PRIMARY KEY (id))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintPrimary(constraint));
    
    assert.strictEqual(constraint.index_options, null);
  });

  await t.test('CreateConstraintPrimary - multiple columns', () => {
    const sql = 'CREATE TABLE users (id INT, email VARCHAR(255), PRIMARY KEY (id, email))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![2];
    assert.ok(isCreateConstraintPrimary(constraint));
    
    assert.strictEqual(constraint.definition.length, 2);
    assert.strictEqual(constraint.definition[0].column, 'id');
    assert.strictEqual(constraint.definition[1].column, 'email');
  });
});

test('CreateConstraintUnique - all properties', async (t) => {
  await t.test('CreateConstraintUnique - basic properties', () => {
    const sql = 'CREATE TABLE users (email VARCHAR(255), UNIQUE KEY (email))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintUnique(constraint));
    
    assert.strictEqual(constraint.constraint_type, 'unique key');
    assert.strictEqual(constraint.resource, 'constraint');
    assert.ok(Array.isArray(constraint.definition));
  });

  await t.test('CreateConstraintUnique - constraint_type variants', () => {
    // Test "unique key"
    const sql1 = 'CREATE TABLE users (email VARCHAR(255), UNIQUE KEY (email))';
    const ast1 = parser.astify(sql1);
    assert.ok(isCreate(ast1));
    const constraint1 = ast1.create_definitions![1];
    assert.ok(isCreateConstraintUnique(constraint1));
    assert.strictEqual(constraint1.constraint_type, 'unique key');

    // Test "unique index"
    const sql2 = 'CREATE TABLE users (email VARCHAR(255), UNIQUE INDEX (email))';
    const ast2 = parser.astify(sql2);
    assert.ok(isCreate(ast2));
    const constraint2 = ast2.create_definitions![1];
    assert.ok(isCreateConstraintUnique(constraint2));
    assert.strictEqual(constraint2.constraint_type, 'unique index');

    // Test "unique" only
    const sql3 = 'CREATE TABLE users (email VARCHAR(255), UNIQUE (email))';
    const ast3 = parser.astify(sql3);
    assert.ok(isCreate(ast3));
    const constraint3 = ast3.create_definitions![1];
    assert.ok(isCreateConstraintUnique(constraint3));
    assert.strictEqual(constraint3.constraint_type, 'unique');
  });

  await t.test('CreateConstraintUnique - with constraint name', () => {
    const sql = 'CREATE TABLE users (email VARCHAR(255), CONSTRAINT uk_email UNIQUE KEY (email))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintUnique(constraint));
    
    assert.strictEqual(constraint.constraint, 'uk_email');
    assert.strictEqual(constraint.keyword, 'constraint');
  });

  await t.test('CreateConstraintUnique - with index name', () => {
    const sql = 'CREATE TABLE users (email VARCHAR(255), UNIQUE KEY idx_email (email))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintUnique(constraint));
    
    assert.strictEqual(constraint.index, 'idx_email');
  });

  await t.test('CreateConstraintUnique - without index name', () => {
    const sql = 'CREATE TABLE users (email VARCHAR(255), UNIQUE KEY (email))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintUnique(constraint));
    
    assert.strictEqual(constraint.index, null);
  });

  await t.test('CreateConstraintUnique - with index_type', () => {
    const sql = 'CREATE TABLE users (email VARCHAR(255), UNIQUE KEY USING HASH (email))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintUnique(constraint));
    
    assert.ok(constraint.index_type);
    assert.strictEqual(constraint.index_type.keyword, 'using');
    assert.strictEqual(constraint.index_type.type, 'hash');
  });

  await t.test('CreateConstraintUnique - with index_options', () => {
    const sql = 'CREATE TABLE users (email VARCHAR(255), UNIQUE KEY (email) VISIBLE)';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintUnique(constraint));
    
    assert.ok(constraint.index_options);
    assert.strictEqual(constraint.index_options.length, 1);
    assert.strictEqual(constraint.index_options[0].type, 'visible');
  });
});

test('CreateConstraintForeign - all properties', async (t) => {
  await t.test('CreateConstraintForeign - basic properties', () => {
    const sql = 'CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintForeign(constraint));
    
    assert.strictEqual(constraint.constraint_type, 'FOREIGN KEY');
    assert.strictEqual(constraint.resource, 'constraint');
    assert.ok(Array.isArray(constraint.definition));
    assert.strictEqual(constraint.definition.length, 1);
  });

  await t.test('CreateConstraintForeign - with constraint name', () => {
    const sql = 'CREATE TABLE orders (user_id INT, CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintForeign(constraint));
    
    assert.strictEqual(constraint.constraint, 'fk_user');
    assert.strictEqual(constraint.keyword, 'constraint');
  });

  await t.test('CreateConstraintForeign - with index name', () => {
    const sql = 'CREATE TABLE orders (user_id INT, FOREIGN KEY fk_user_id (user_id) REFERENCES users(id))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintForeign(constraint));
    
    assert.strictEqual(constraint.index, 'fk_user_id');
  });

  await t.test('CreateConstraintForeign - without index name', () => {
    const sql = 'CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintForeign(constraint));
    
    assert.strictEqual(constraint.index, null);
  });

  await t.test('CreateConstraintForeign - with reference_definition', () => {
    const sql = 'CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintForeign(constraint));
    
    assert.ok(constraint.reference_definition);
    assert.strictEqual(constraint.reference_definition.keyword, 'references');
    assert.ok(constraint.reference_definition.on_action);
    assert.strictEqual(constraint.reference_definition.on_action.length, 1);
  });

  await t.test('CreateConstraintForeign - without reference_definition', () => {
    const sql = 'CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintForeign(constraint));
    
    // reference_definition should exist but on_action should be empty
    assert.ok(constraint.reference_definition);
    assert.strictEqual(constraint.reference_definition.on_action.length, 0);
  });
});

test('CreateConstraintCheck - all properties', async (t) => {
  await t.test('CreateConstraintCheck - basic properties', () => {
    const sql = 'CREATE TABLE products (price INT, CHECK (price > 0))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintCheck(constraint));
    
    assert.strictEqual(constraint.constraint_type, 'check');
    assert.strictEqual(constraint.resource, 'constraint');
    assert.ok(Array.isArray(constraint.definition));
    assert.strictEqual(constraint.definition.length, 1);
  });

  await t.test('CreateConstraintCheck - with constraint name', () => {
    const sql = 'CREATE TABLE products (price INT, CONSTRAINT chk_price CHECK (price > 0))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintCheck(constraint));
    
    assert.strictEqual(constraint.constraint, 'chk_price');
    assert.strictEqual(constraint.keyword, 'constraint');
  });

  await t.test('CreateConstraintCheck - without constraint name', () => {
    const sql = 'CREATE TABLE products (price INT, CHECK (price > 0))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintCheck(constraint));
    
    assert.strictEqual(constraint.constraint, null);
    assert.strictEqual(constraint.keyword, null);
  });

  await t.test('CreateConstraintCheck - definition is Binary array', () => {
    const sql = 'CREATE TABLE products (price INT, CHECK (price > 0))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintCheck(constraint));
    
    assert.ok(Array.isArray(constraint.definition));
    assert.strictEqual(constraint.definition.length, 1);
    assert.strictEqual(constraint.definition[0].type, 'binary_expr');
    assert.strictEqual(constraint.definition[0].operator, '>');
  });

  await t.test('CreateConstraintCheck - index_type for NOT FOR REPLICATION', () => {
    // Note: NOT FOR REPLICATION is a SQL Server feature, may not work in MySQL
    // This test verifies the type structure if it were supported
    const sql = 'CREATE TABLE products (price INT, CHECK (price > 0))';
    const ast = parser.astify(sql);
    
    assert.ok(isCreate(ast));
    const constraint = ast.create_definitions![1];
    assert.ok(isCreateConstraintCheck(constraint));
    
    // In standard MySQL, index_type should be null
    assert.strictEqual(constraint.index_type, null);
  });
});
