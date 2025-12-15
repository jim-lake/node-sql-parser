import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Delete, From, Dual, Binary, Unary, Function as FunctionType } from '../../../types.d.ts';
import { isDelete, isFrom, isDual, isBinary, isUnary, isFunction } from './types.guard.ts';

const parser = new Parser();

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
