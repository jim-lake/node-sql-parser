import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Delete, From, Dual, Binary, Unary, Function as FunctionType } from '../../../types.d.ts';
import { isDelete, isFrom, isDual, isBinary, isUnary, isFunction } from './types.guard.ts';

const parser = new Parser();

// Test Delete.with - With[] variant
test('Delete.with as With[]', () => {
  const sql = 'WITH cte AS (SELECT id FROM temp) DELETE FROM users WHERE id IN (SELECT id FROM cte)';
  const ast = parser.astify(sql);
  assert.ok(isDelete(ast));
  const del = ast as Delete;
  assert.ok(Array.isArray(del.with));
  assert.strictEqual(del.with!.length, 1);
  assert.strictEqual(del.with![0].name.value, 'cte');
});

// Test Delete.with - null variant
test('Delete.with as null', () => {
  const sql = 'DELETE FROM users';
  const ast = parser.astify(sql);
  assert.ok(isDelete(ast));
  const del = ast as Delete;
  assert.strictEqual(del.with, null);
});

// Test Delete.table - with addition property
test('Delete.table with addition property', () => {
  const sql = 'DELETE t1, t2 FROM t1 INNER JOIN t2 WHERE t1.id = t2.id';
  const ast = parser.astify(sql);
  assert.ok(isDelete(ast));
  const del = ast as Delete;
  if (del.table) {
    assert.ok(Array.isArray(del.table));
    // Check if addition property exists
    assert.ok(del.table.length > 0);
  }
});

// Test Delete.table - array variant (simple DELETE has addition:true)
test('Delete.table with addition:true (simple DELETE)', () => {
  const sql = 'DELETE FROM users WHERE id = 1';
  const ast = parser.astify(sql);
  assert.ok(isDelete(ast));
  const del = ast as Delete;
  // Simple DELETE FROM creates table array with addition:true
  assert.ok(Array.isArray(del.table));
  assert.strictEqual(del.table!.length, 1);
  assert.strictEqual(del.table![0].addition, true);
  assert.strictEqual(del.table![0].table, 'users');
});

// Test Delete.from - Array<From | Dual> with From
test('Delete.from as Array<From>', () => {
  const sql = 'DELETE FROM users';
  const ast = parser.astify(sql);
  assert.ok(isDelete(ast));
  const del = ast as Delete;
  assert.ok(Array.isArray(del.from));
  assert.strictEqual(del.from.length, 1);
  assert.ok(isFrom(del.from[0]));
  const from = del.from[0] as From;
  assert.strictEqual(from.table, 'users');
});

// Test Delete.from - with multiple tables (JOIN)
test('Delete.from with multiple tables (JOIN)', () => {
  const sql = 'DELETE FROM users u JOIN orders o ON u.id = o.user_id WHERE u.id = 1';
  const ast = parser.astify(sql);
  assert.ok(isDelete(ast));
  const del = ast as Delete;
  assert.ok(Array.isArray(del.from));
  assert.ok(del.from.length >= 1);
});

// Test Delete.where - Binary variant
test('Delete.where as Binary', () => {
  const sql = 'DELETE FROM users WHERE id = 1';
  const ast = parser.astify(sql);
  assert.ok(isDelete(ast));
  const del = ast as Delete;
  assert.ok(del.where);
  assert.ok(isBinary(del.where));
  const binary = del.where as Binary;
  assert.strictEqual(binary.type, 'binary_expr');
});

// Test Delete.where - Unary variant
test('Delete.where as Unary', () => {
  const sql = 'DELETE FROM users WHERE NOT active';
  const ast = parser.astify(sql);
  assert.ok(isDelete(ast));
  const del = ast as Delete;
  assert.ok(del.where);
  if (del.where && 'type' in del.where && del.where.type === 'unary_expr') {
    assert.ok(isUnary(del.where));
  }
});

// Test Delete.where - Function variant
test('Delete.where as Function', () => {
  const sql = 'DELETE FROM users WHERE ISNULL(deleted_at)';
  const ast = parser.astify(sql);
  assert.ok(isDelete(ast));
  const del = ast as Delete;
  assert.ok(del.where);
  if (del.where && 'type' in del.where && del.where.type === 'function') {
    assert.ok(isFunction(del.where));
  }
});

// Test Delete.where - null variant
test('Delete.where as null', () => {
  const sql = 'DELETE FROM users';
  const ast = parser.astify(sql);
  assert.ok(isDelete(ast));
  const del = ast as Delete;
  assert.strictEqual(del.where, null);
});

// Test Delete.orderby - OrderBy[] variant
test('Delete.orderby as OrderBy[]', () => {
  const sql = 'DELETE FROM users ORDER BY id DESC';
  const ast = parser.astify(sql);
  assert.ok(isDelete(ast));
  const del = ast as Delete;
  assert.ok(Array.isArray(del.orderby));
  assert.strictEqual(del.orderby!.length, 1);
  assert.strictEqual(del.orderby![0].type, 'DESC');
});

// Test Delete.orderby - null variant
test('Delete.orderby as null', () => {
  const sql = 'DELETE FROM users';
  const ast = parser.astify(sql);
  assert.ok(isDelete(ast));
  const del = ast as Delete;
  assert.strictEqual(del.orderby, null);
});

// Test Delete.limit - Limit variant
test('Delete.limit as Limit', () => {
  const sql = 'DELETE FROM users LIMIT 10';
  const ast = parser.astify(sql);
  assert.ok(isDelete(ast));
  const del = ast as Delete;
  assert.ok(del.limit);
  assert.ok(Array.isArray(del.limit!.value));
});

// Test Delete.limit - null variant
test('Delete.limit as null', () => {
  const sql = 'DELETE FROM users';
  const ast = parser.astify(sql);
  assert.ok(isDelete(ast));
  const del = ast as Delete;
  assert.strictEqual(del.limit, null);
});

// Test Delete.type
test('Delete.type as "delete"', () => {
  const sql = 'DELETE FROM users';
  const ast = parser.astify(sql);
  assert.ok(isDelete(ast));
  const del = ast as Delete;
  assert.strictEqual(del.type, 'delete');
});
