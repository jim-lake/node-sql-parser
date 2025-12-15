import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Create, CreateColumnDefinition, CreateConstraintPrimary } from '../../types.d.ts';
import { isCreate, isCreateColumnDefinition, isCreateConstraintPrimary } from './types.guard.js';

const parser = new Parser();

test('ConstraintName in PRIMARY KEY', () => {
  const sql = 'CREATE TABLE users (id INT, CONSTRAINT pk_users PRIMARY KEY (id))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create', 'Should be Create type');
  assert.ok(ast.create_definitions, 'Should have create_definitions');
  
  const constraint = ast.create_definitions.find(def => 
    'constraint_type' in def && def.constraint_type === 'primary key'
  );
  
  assert.ok(constraint, 'Should have primary key constraint');
  assert.ok(isCreateConstraintPrimary(constraint), 'Should be CreateConstraintPrimary');
  
  if ('constraint' in constraint && constraint.constraint) {
    assert.strictEqual(constraint.constraint, 'pk_users', 'Should have constraint name');
  }
  if ('keyword' in constraint && constraint.keyword) {
    assert.strictEqual(constraint.keyword, 'constraint', 'Should have constraint keyword');
  }
});

test('LiteralNull in column definition', () => {
  const sql = 'CREATE TABLE users (name VARCHAR(50) NULL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create', 'Should be Create type');
  assert.ok(ast.create_definitions, 'Should have create_definitions');
  
  const colDef = ast.create_definitions[0];
  assert.ok(isCreateColumnDefinition(colDef), 'Should be CreateColumnDefinition');
  
  if ('nullable' in colDef && colDef.nullable) {
    assert.strictEqual(colDef.nullable.type, 'null', 'Should have null type');
    assert.strictEqual(colDef.nullable.value, 'null', 'Should have null value');
  }
});

test('LiteralNotNull in column definition', () => {
  const sql = 'CREATE TABLE users (name VARCHAR(50) NOT NULL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create', 'Should be Create type');
  assert.ok(ast.create_definitions, 'Should have create_definitions');
  
  const colDef = ast.create_definitions[0];
  assert.ok(isCreateColumnDefinition(colDef), 'Should be CreateColumnDefinition');
  
  if ('nullable' in colDef && colDef.nullable) {
    assert.strictEqual(colDef.nullable.type, 'not null', 'Should have not null type');
    assert.strictEqual(colDef.nullable.value, 'not null', 'Should have not null value');
  }
});
