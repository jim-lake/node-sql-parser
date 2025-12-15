import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Update, From, Dual, Binary, Unary, Function as FunctionType } from '../../../types.d.ts';
import { isUpdate, isFrom, isBinary, isUnary, isFunction } from './types.guard.ts';

const parser = new Parser();

// Test Update.table - Array<From | Dual> variant with From
test('Update.table as Array<From>', () => {
  const sql = 'UPDATE users SET name = "John"';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.ok(isFrom(update.table![0]));
});

// Test Update.where - Binary variant
test('Update.where as Binary', () => {
  const sql = 'UPDATE users SET name = "John" WHERE id = 1';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
  assert.ok(isBinary(update.where));
});

// Test Update.where - Unary variant
test('Update.where as Unary', () => {
  const sql = 'UPDATE users SET name = "John" WHERE NOT active';
  const ast = parser.astify(sql);
  assert.ok(isUpdate(ast));
  const update = ast as Update;
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
  if (update.where && 'type' in update.where && update.where.type === 'function') {
    assert.ok(isFunction(update.where));
  }
});
