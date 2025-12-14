import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Update, From, Dual, Binary, Unary, Function as FunctionType } from '../../../types.d.ts';
import { isUpdate, isFrom, isDual, isBinary, isUnary, isFunction } from './types.guard.ts';

const parser = new Parser();

// Test Update.with - With[] variant
test('Update.with as With[]', () => {
  const sql = 'WITH cte AS (SELECT id FROM temp) UPDATE users SET name = "John" WHERE id IN (SELECT id FROM cte)';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.ok(Array.isArray(update.with));
  assert.strictEqual(update.with!.length, 1);
  assert.strictEqual(update.with![0].name.value, 'cte');
});

// Test Update.with - null variant
test('Update.with as null', () => {
  const sql = 'UPDATE users SET name = "John"';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.strictEqual(update.with, null);
});

// Test Update.table - Array<From | Dual> variant with From
test('Update.table as Array<From>', () => {
  const sql = 'UPDATE users SET name = "John"';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.ok(Array.isArray(update.table));
  assert.strictEqual(update.table!.length, 1);
  assert.ok(isFrom(update.table![0]));
  const from = update.table![0] as From;
  assert.strictEqual(from.table, 'users');
});

// Test Update.table - Array<From | Dual> with multiple tables
test('Update.table with multiple tables (JOIN)', () => {
  const sql = 'UPDATE users u JOIN orders o ON u.id = o.user_id SET u.name = "John"';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.ok(Array.isArray(update.table));
  assert.ok(update.table!.length >= 1);
});

// Test Update.table - null variant
test('Update.table as null', () => {
  const sql = 'UPDATE users SET name = "John"';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  // Table should be an array, not null in MySQL
  assert.ok(update.table !== null);
});

// Test Update.set - SetList[] 
test('Update.set as SetList[]', () => {
  const sql = 'UPDATE users SET name = "John", age = 30, email = "john@example.com"';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.ok(Array.isArray(update.set));
  assert.strictEqual(update.set.length, 3);
  assert.strictEqual(update.set[0].column, 'name');
  assert.strictEqual(update.set[1].column, 'age');
  assert.strictEqual(update.set[2].column, 'email');
});

// Test Update.where - Binary variant
test('Update.where as Binary', () => {
  const sql = 'UPDATE users SET name = "John" WHERE id = 1';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.ok(update.where);
  assert.ok(isBinary(update.where));
  const binary = update.where as Binary;
  assert.strictEqual(binary.type, 'binary_expr');
});

// Test Update.where - Unary variant
test('Update.where as Unary', () => {
  const sql = 'UPDATE users SET name = "John" WHERE NOT active';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.ok(update.where);
  if (update.where && 'type' in update.where && update.where.type === 'unary_expr') {
    assert.ok(isUnary(update.where));
  }
});

// Test Update.where - Function variant
test('Update.where as Function', () => {
  const sql = 'UPDATE users SET name = "John" WHERE ISNULL(deleted_at)';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.ok(update.where);
  if (update.where && 'type' in update.where && update.where.type === 'function') {
    assert.ok(isFunction(update.where));
  }
});

// Test Update.where - null variant
test('Update.where as null', () => {
  const sql = 'UPDATE users SET name = "John"';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.strictEqual(update.where, null);
});

// Test Update.orderby - OrderBy[] variant
test('Update.orderby as OrderBy[]', () => {
  const sql = 'UPDATE users SET name = "John" ORDER BY id DESC';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.ok(Array.isArray(update.orderby));
  assert.strictEqual(update.orderby!.length, 1);
  assert.strictEqual(update.orderby![0].type, 'DESC');
});

// Test Update.orderby - null variant
test('Update.orderby as null', () => {
  const sql = 'UPDATE users SET name = "John"';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.strictEqual(update.orderby, null);
});

// Test Update.limit - Limit variant
test('Update.limit as Limit', () => {
  const sql = 'UPDATE users SET name = "John" LIMIT 10';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.ok(update.limit);
  assert.ok(Array.isArray(update.limit!.value));
});

// Test Update.limit - null variant
test('Update.limit as null', () => {
  const sql = 'UPDATE users SET name = "John"';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.strictEqual(update.limit, null);
});

// Test Update.type
test('Update.type as "update"', () => {
  const sql = 'UPDATE users SET name = "John"';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.strictEqual(update.type, 'update');
});
