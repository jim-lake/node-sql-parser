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
  
  
  const constraint = ast.create_definitions.find(def => 
    'constraint_type' in def && def.constraint_type === 'primary key'
  );
  
  assert.ok(isCreateConstraintPrimary(constraint), 'Should be CreateConstraintPrimary');
  
  if ('constraint' in constraint && constraint.constraint) {
  }
  if ('keyword' in constraint && constraint.keyword) {
  }
});

test('LiteralNull in column definition', () => {
  const sql = 'CREATE TABLE users (name VARCHAR(50) NULL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  
  const colDef = ast.create_definitions[0];
  assert.ok(isCreateColumnDefinition(colDef), 'Should be CreateColumnDefinition');
  
  if ('nullable' in colDef && colDef.nullable) {
  }
});

test('LiteralNotNull in column definition', () => {
  const sql = 'CREATE TABLE users (name VARCHAR(50) NOT NULL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  
  const colDef = ast.create_definitions[0];
  assert.ok(isCreateColumnDefinition(colDef), 'Should be CreateColumnDefinition');
  
  if ('nullable' in colDef && colDef.nullable) {
  }
});
