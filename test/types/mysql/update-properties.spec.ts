import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Update, From, Dual, Binary, Unary, Function as FunctionType } from '../../../types.d.ts';
import { isUpdate, isFrom, isDual, isBinary, isUnary, isFunction } from './types.guard.ts';

const parser = new Parser();

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
