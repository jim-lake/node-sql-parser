import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateTable, CreateColumnDefinition } from '../../../types.d.ts';
import { isCreateTable } from './types.guard.ts';

const parser = new Parser();

test('Column with GENERATED (AS shorthand)', () => {
  const sql = 'CREATE TABLE users (id INT, full_name VARCHAR(100) AS (CONCAT(id, id)))';
  const ast = parser.astify(sql);
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.create_definitions);
  const colDef = create.create_definitions[1] as CreateColumnDefinition;
  assert.ok(colDef.generated);
  assert.strictEqual(colDef.generated.type, 'generated');
  assert.ok(colDef.generated.expr);
});

test('Column with GENERATED STORED', () => {
  const sql = 'CREATE TABLE users (id INT, full_name VARCHAR(100) AS (id) STORED)';
  const ast = parser.astify(sql);
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.create_definitions);
  const colDef = create.create_definitions[1] as CreateColumnDefinition;
  assert.ok(colDef.generated);
  assert.strictEqual(colDef.generated.type, 'generated');
  assert.strictEqual(colDef.generated.storage_type, 'stored');
});

test('Column with GENERATED VIRTUAL', () => {
  const sql = 'CREATE TABLE users (id INT, full_name VARCHAR(100) AS (id) VIRTUAL)';
  const ast = parser.astify(sql);
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.create_definitions);
  const colDef = create.create_definitions[1] as CreateColumnDefinition;
  assert.ok(colDef.generated);
  assert.strictEqual(colDef.generated.type, 'generated');
  assert.strictEqual(colDef.generated.storage_type, 'virtual');
});

test('Column with unique variants', () => {
  const sql1 = 'CREATE TABLE t1 (id INT UNIQUE)';
  const ast1 = parser.astify(sql1);
  assert.ok(isCreateTable(ast1));
  const create1 = ast1 as CreateTable;
  const colDef1 = create1.create_definitions![0] as CreateColumnDefinition;
  assert.ok(colDef1.unique === 'unique' || colDef1.unique === 'unique key');

  const sql2 = 'CREATE TABLE t2 (id INT UNIQUE KEY)';
  const ast2 = parser.astify(sql2);
  assert.ok(isCreateTable(ast2));
  const create2 = ast2 as CreateTable;
  const colDef2 = create2.create_definitions![0] as CreateColumnDefinition;
  assert.ok(colDef2.unique === 'unique' || colDef2.unique === 'unique key');
});
