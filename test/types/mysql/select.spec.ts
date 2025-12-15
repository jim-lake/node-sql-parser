import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Column, ColumnRef, From, Binary, OrderBy } from '../../types.d.ts';
import { isSelect, isColumnRef } from './types.guard.ts';

const parser = new Parser();

test('SELECT * FROM table', () => {
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.type, 'select');
  assert.ok(Array.isArray(selectAst.columns));
  const cols = selectAst.columns as Column[];
  assert.ok(isColumnRef(cols[0].expr), 'Column expr should be ColumnRef');
  assert.strictEqual(((cols[0].expr as ColumnRef).column as string), '*');
  assert.ok(Array.isArray(selectAst.from));
  assert.strictEqual((selectAst.from as From[])[0].table, 'users');
});

test('SELECT with columns', () => {
  const sql = 'SELECT id, name FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.type, 'select');
  assert.ok(Array.isArray(selectAst.columns));
  const cols = selectAst.columns as Column[];
  assert.strictEqual(cols.length, 2);
  assert.ok(isColumnRef(cols[0].expr), 'First column expr should be ColumnRef');
  assert.ok(isColumnRef(cols[1].expr), 'Second column expr should be ColumnRef');
  assert.strictEqual(((cols[0].expr as ColumnRef).column as string), 'id');
  assert.strictEqual(((cols[1].expr as ColumnRef).column as string), 'name');
});


