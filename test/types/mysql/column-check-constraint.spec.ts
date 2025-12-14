import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateTable, CreateColumnDefinition } from '../../../types.d.ts';
import { isCreateTable, isCreateColumnDefinition } from './types.guard.ts';

const parser = new Parser();

test('Column with CHECK constraint', () => {
  const sql = 'CREATE TABLE t (age INT CHECK (age >= 0))';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.create_definitions);
  
  const colDef = create.create_definitions[0] as CreateColumnDefinition;
  
  // Verify check property exists
  assert.ok(colDef.check);
  
  // Verify check structure
  assert.strictEqual(colDef.check.constraint_type, 'check');
  assert.ok(Array.isArray(colDef.check.definition));
  assert.ok(colDef.check.definition.length > 0);
});

test('Column with named CHECK constraint', () => {
  const sql = 'CREATE TABLE t (age INT CONSTRAINT age_check CHECK (age >= 0))';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.create_definitions);
  
  const colDef = create.create_definitions[0] as CreateColumnDefinition;
  
  // Verify check property with constraint name
  assert.ok(colDef.check);
  assert.strictEqual(colDef.check.constraint, 'age_check');
  assert.strictEqual(colDef.check.keyword, 'constraint');
});

test('Column with CHECK constraint and ENFORCED', () => {
  const sql = 'CREATE TABLE t (age INT CHECK (age >= 0) ENFORCED)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.create_definitions);
  
  const colDef = create.create_definitions[0] as CreateColumnDefinition;
  
  // Verify check property with enforced
  assert.ok(colDef.check);
  assert.strictEqual(colDef.check.enforced, 'enforced');
});

test('Column with CHECK constraint and NOT ENFORCED', () => {
  const sql = 'CREATE TABLE t (age INT CHECK (age >= 0) NOT ENFORCED)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.create_definitions);
  
  const colDef = create.create_definitions[0] as CreateColumnDefinition;
  
  // Verify check property with not enforced
  assert.ok(colDef.check);
  assert.strictEqual(colDef.check.enforced, 'not enforced');
});

