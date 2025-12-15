import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateTable, CreateColumnDefinition } from '../../types.d.ts';
import { isCreate, isCreateColumnDefinition } from './types.guard.ts';

const parser = new Parser();

test('DataType suffix - UNSIGNED', () => {
  const sql = 'CREATE TABLE t (id INT UNSIGNED)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const createTable = ast as CreateTable;
  const colDef = createTable.create_definitions?.[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
  const dataType = colDef.definition;
});

test('DataType suffix - ZEROFILL', () => {
  const sql = 'CREATE TABLE t (id INT ZEROFILL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const createTable = ast as CreateTable;
  const colDef = createTable.create_definitions?.[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
  const dataType = colDef.definition;
});

test('DataType suffix - UNSIGNED ZEROFILL', () => {
  const sql = 'CREATE TABLE t (id INT UNSIGNED ZEROFILL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const createTable = ast as CreateTable;
  const colDef = createTable.create_definitions?.[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
  const dataType = colDef.definition;
});

test('DataType suffix - Timezone NOT in MySQL', () => {
  const sql = 'CREATE TABLE t (created_at TIMESTAMP)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  assert.ok(isCreateColumnDefinition((ast as CreateTable).create_definitions?.[0]));
});
