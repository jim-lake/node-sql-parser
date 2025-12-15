import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, With, From, Binary, Unary, Function as FunctionType } from '../../../types.d.ts';
import { isSelect, isWith, isBinary, isUnary, isFunction } from './types.guard.ts';

const parser = new Parser();

// Select.with - With[] when WITH clause present
test('Select.with - With[] when WITH clause present', () => {
  const sql = 'WITH cte AS (SELECT id FROM users) SELECT * FROM cte';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.with);
  assert.ok(Array.isArray(select.with));
  assert.ok(isWith(select.with[0]));
});

// Select.where - Binary expression
test('Select.where - Binary expression', () => {
  const sql = 'SELECT * FROM users WHERE id = 1';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.where);
  assert.ok(isBinary(select.where));
});

// Select.where - Unary expression
test('Select.where - Unary expression', () => {
  const sql = 'SELECT * FROM users WHERE NOT active';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.where);
  assert.ok(isUnary(select.where) || isBinary(select.where));
});

// Select.where - Function expression
test('Select.where - Function expression', () => {
  const sql = 'SELECT * FROM users WHERE ISNULL(name)';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.where);
  assert.ok(isFunction(select.where));
});

// Select.having - Binary expression
test('Select.having - Binary expression', () => {
  const sql = 'SELECT dept, COUNT(*) FROM users GROUP BY dept HAVING COUNT(*) > 5';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.having);
  assert.ok(isBinary(select.having));
});

// Select._next and set_op - UNION
test('Select._next and set_op - UNION', () => {
  const sql = 'SELECT id FROM users UNION SELECT id FROM admins';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select._next);
  assert.ok(isSelect(select._next));
  assert.strictEqual(select.set_op, 'union');
});
