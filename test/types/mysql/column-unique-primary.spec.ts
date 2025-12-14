import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateTable, CreateColumnDefinition } from '../../../types.d.ts';
import { isCreateTable } from './types.guard.ts';

const parser = new Parser();

test('Column with UNIQUE', () => {
  const sql = 'CREATE TABLE t (id INT UNIQUE)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.create_definitions);
  
  const colDef = create.create_definitions[0] as CreateColumnDefinition;
  assert.strictEqual(colDef.unique, 'unique');
});

test('Column with UNIQUE KEY', () => {
  const sql = 'CREATE TABLE t (id INT UNIQUE KEY)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.create_definitions);
  
  const colDef = create.create_definitions[0] as CreateColumnDefinition;
  assert.strictEqual(colDef.unique, 'unique key');
});

test('Column with PRIMARY KEY', () => {
  const sql = 'CREATE TABLE t (id INT PRIMARY KEY)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.create_definitions);
  
  const colDef = create.create_definitions[0] as CreateColumnDefinition;
  assert.strictEqual(colDef.primary_key, 'primary key');
});

test('Column with KEY (shorthand for PRIMARY KEY)', () => {
  const sql = 'CREATE TABLE t (id INT KEY)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.create_definitions);
  
  const colDef = create.create_definitions[0] as CreateColumnDefinition;
  assert.strictEqual(colDef.primary_key, 'key');
});
