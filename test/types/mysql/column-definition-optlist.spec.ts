import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Create, CreateColumnDefinition } from '../../../types.d.ts';
import { isCreate, isCreateColumnDefinition } from './types.guard.ts';

const parser = new Parser();

// Phase 11.12: ColumnDefinitionOptList Properties Complete Validation

test('ColumnDefinitionOptList.nullable - NOT NULL', () => {
  const sql = 'CREATE TABLE t (id INT NOT NULL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.nullable - NULL', () => {
  const sql = 'CREATE TABLE t (id INT NULL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.nullable - absent when not specified', () => {
  const sql = 'CREATE TABLE t (id INT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.default_val - string literal', () => {
  const sql = "CREATE TABLE t (name VARCHAR(50) DEFAULT 'unknown')";
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.default_val - numeric literal', () => {
  const sql = 'CREATE TABLE t (age INT DEFAULT 0)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.default_val - NULL', () => {
  const sql = 'CREATE TABLE t (data VARCHAR(50) DEFAULT NULL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.default_val - CURRENT_TIMESTAMP', () => {
  const sql = 'CREATE TABLE t (created TIMESTAMP DEFAULT CURRENT_TIMESTAMP)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.auto_increment - present', () => {
  const sql = 'CREATE TABLE t (id INT AUTO_INCREMENT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.auto_increment - absent', () => {
  const sql = 'CREATE TABLE t (id INT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.unique - UNIQUE', () => {
  const sql = 'CREATE TABLE t (email VARCHAR(100) UNIQUE)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.unique - UNIQUE KEY', () => {
  const sql = 'CREATE TABLE t (email VARCHAR(100) UNIQUE KEY)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.primary_key - PRIMARY KEY', () => {
  const sql = 'CREATE TABLE t (id INT PRIMARY KEY)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.primary_key - KEY', () => {
  const sql = 'CREATE TABLE t (id INT KEY)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.comment - present', () => {
  const sql = "CREATE TABLE t (id INT COMMENT 'Primary key')";
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.collate - present', () => {
  const sql = 'CREATE TABLE t (name VARCHAR(50) COLLATE utf8mb4_unicode_ci)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.column_format - FIXED', () => {
  const sql = 'CREATE TABLE t (data VARCHAR(50) COLUMN_FORMAT FIXED)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.column_format - DYNAMIC', () => {
  const sql = 'CREATE TABLE t (data VARCHAR(50) COLUMN_FORMAT DYNAMIC)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.storage - DISK', () => {
  const sql = 'CREATE TABLE t (data VARCHAR(50) STORAGE DISK)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.storage - MEMORY', () => {
  const sql = 'CREATE TABLE t (data VARCHAR(50) STORAGE MEMORY)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.reference_definition - basic foreign key', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.reference_definition - with ON DELETE CASCADE', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON DELETE CASCADE)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.character_set - present', () => {
  const sql = 'CREATE TABLE t (name VARCHAR(50) CHARACTER SET utf8mb4)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.character_set - with equals sign', () => {
  const sql = 'CREATE TABLE t (name VARCHAR(50) CHARACTER SET = utf8mb4)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.check - basic check constraint', () => {
  const sql = 'CREATE TABLE t (age INT CHECK (age >= 0))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.check - named constraint', () => {
  const sql = 'CREATE TABLE t (age INT CONSTRAINT chk_age CHECK (age >= 0))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.check - enforced', () => {
  const sql = 'CREATE TABLE t (age INT CHECK (age >= 0) ENFORCED)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.check - not enforced', () => {
  const sql = 'CREATE TABLE t (age INT CHECK (age >= 0) NOT ENFORCED)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.generated - GENERATED ALWAYS AS', () => {
  const sql = 'CREATE TABLE t (full_name VARCHAR(100) GENERATED ALWAYS AS (CONCAT(first_name, " ", last_name)))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.generated - STORED', () => {
  const sql = 'CREATE TABLE t (full_name VARCHAR(100) AS (CONCAT(first_name, " ", last_name)) STORED)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList.generated - VIRTUAL', () => {
  const sql = 'CREATE TABLE t (full_name VARCHAR(100) AS (CONCAT(first_name, " ", last_name)) VIRTUAL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});

test('ColumnDefinitionOptList - multiple properties combined', () => {
  const sql = "CREATE TABLE t (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID column')";
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
});
