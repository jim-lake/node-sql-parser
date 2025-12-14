import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateTable } from '../../../types.d.ts';
import { isCreate, isCreateTable } from './types.guard.ts';

const parser = new Parser();

test('CreateTable.temporary - verify "temporary" literal', () => {
  const sql = 'CREATE TEMPORARY TABLE temp_users (id INT)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.strictEqual(create.temporary, 'temporary');
});

test('CreateTable.temporary - verify null when not present', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.strictEqual(create.temporary, null);
});

test('CreateTable.table - verify array type', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(Array.isArray(create.table));
  assert.strictEqual(create.table.length, 1);
  assert.strictEqual(create.table[0].table, 'users');
  assert.strictEqual(create.table[0].db, null);
});

test('CreateTable.table - verify with database prefix', () => {
  const sql = 'CREATE TABLE mydb.users (id INT)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(Array.isArray(create.table));
  assert.strictEqual(create.table[0].table, 'users');
  assert.strictEqual(create.table[0].db, 'mydb');
});

test('CreateTable.if_not_exists - verify "IF NOT EXISTS" literal', () => {
  const sql = 'CREATE TABLE IF NOT EXISTS users (id INT)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.strictEqual(create.if_not_exists, 'IF NOT EXISTS');
});

test('CreateTable.if_not_exists - verify null when not present', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.strictEqual(create.if_not_exists, null);
});

test('CreateTable.like - verify all properties', () => {
  const sql = 'CREATE TABLE new_users LIKE users';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.like);
  assert.strictEqual(create.like.type, 'like');
  assert.ok(Array.isArray(create.like.table));
  assert.strictEqual(create.like.table[0].table, 'users');
});

test('CreateTable.like - verify parentheses property', () => {
  const sql = 'CREATE TABLE new_users (LIKE users)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.like);
  assert.strictEqual(create.like.parentheses, true);
});

test('CreateTable.like - verify null when not present', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.like === null || create.like === undefined);
});

test('CreateTable.ignore_replace - verify "ignore" value', () => {
  const sql = 'CREATE TABLE users IGNORE SELECT * FROM old_users';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.strictEqual(create.ignore_replace, 'ignore');
});

test('CreateTable.ignore_replace - verify "replace" value', () => {
  const sql = 'CREATE TABLE users REPLACE SELECT * FROM old_users';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.strictEqual(create.ignore_replace, 'replace');
});

test('CreateTable.ignore_replace - verify null when not present', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.strictEqual(create.ignore_replace, null);
});

test('CreateTable.as - verify string value', () => {
  const sql = 'CREATE TABLE users AS SELECT * FROM old_users';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.strictEqual(create.as, 'as');
});

test('CreateTable.as - verify null when not present', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.strictEqual(create.as, null);
});

test('CreateTable.query_expr - verify Select type', () => {
  const sql = 'CREATE TABLE users AS SELECT * FROM old_users';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.query_expr);
  assert.strictEqual(create.query_expr.type, 'select');
});

test('CreateTable.query_expr - verify null when not present', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.strictEqual(create.query_expr, null);
});

test('CreateTable.create_definitions - verify CreateColumnDefinition', () => {
  const sql = 'CREATE TABLE users (id INT, name VARCHAR(100))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.create_definitions);
  assert.ok(Array.isArray(create.create_definitions));
  assert.ok(create.create_definitions.length > 0);
  assert.strictEqual(create.create_definitions[0].resource, 'column');
});

test('CreateTable.create_definitions - verify CreateIndexDefinition', () => {
  const sql = 'CREATE TABLE users (id INT, INDEX idx_id (id))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.create_definitions);
  const indexDef = create.create_definitions.find(d => d.resource === 'index');
  assert.ok(indexDef);
  assert.strictEqual(indexDef.keyword, 'index');
});

test('CreateTable.create_definitions - verify CreateConstraintDefinition', () => {
  const sql = 'CREATE TABLE users (id INT, PRIMARY KEY (id))';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.create_definitions);
  const constraintDef = create.create_definitions.find(d => d.resource === 'constraint');
  assert.ok(constraintDef);
  assert.strictEqual(constraintDef.constraint_type, 'primary key');
});

test('CreateTable.create_definitions - verify null when not present', () => {
  const sql = 'CREATE TABLE users AS SELECT * FROM old_users';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.create_definitions === null || create.create_definitions === undefined);
});

test('CreateTable.table_options - verify TableOption array', () => {
  const sql = 'CREATE TABLE users (id INT) ENGINE=InnoDB';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.table_options);
  assert.ok(Array.isArray(create.table_options));
  assert.ok(create.table_options.length > 0);
  assert.strictEqual(create.table_options[0].keyword, 'engine');
});

test('CreateTable.table_options - verify multiple options', () => {
  const sql = 'CREATE TABLE users (id INT) ENGINE=InnoDB CHARSET=utf8mb4';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.table_options);
  assert.ok(create.table_options.length >= 2);
});

test('CreateTable.table_options - verify null when not present', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.table_options === null || create.table_options === undefined);
});
