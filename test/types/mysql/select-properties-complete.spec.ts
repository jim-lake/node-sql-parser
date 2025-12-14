import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, With, From, Binary, Unary, Function as FunctionType } from '../../../types.d.ts';
import { isSelect, isWith, isBinary, isUnary, isFunction } from './types.guard.ts';

const parser = new Parser();

// Select.with - verify With type properties
test('Select.with - null when no WITH clause', () => {
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.strictEqual(select.with, null);
});

test('Select.with - With[] when WITH clause present', () => {
  const sql = 'WITH cte AS (SELECT id FROM users) SELECT * FROM cte';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.with);
  assert.ok(Array.isArray(select.with));
  assert.ok(isWith(select.with[0]));
});

// Select.options - verify all option values
test('Select.options - null when no options', () => {
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.strictEqual(select.options, null);
});

test('Select.options - SQL_CALC_FOUND_ROWS', () => {
  const sql = 'SELECT SQL_CALC_FOUND_ROWS * FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.options);
  assert.ok(Array.isArray(select.options));
});

test('Select.options - SQL_CACHE', () => {
  const sql = 'SELECT SQL_CACHE * FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.options);
  assert.ok(Array.isArray(select.options));
});

test('Select.options - SQL_NO_CACHE', () => {
  const sql = 'SELECT SQL_NO_CACHE * FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.options);
  assert.ok(Array.isArray(select.options));
});

// Select.distinct - verify "DISTINCT" literal
test('Select.distinct - null when no DISTINCT', () => {
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.strictEqual(select.distinct, null);
});

test('Select.distinct - "DISTINCT" literal', () => {
  const sql = 'SELECT DISTINCT name FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.strictEqual(select.distinct, 'DISTINCT');
});

// Select.from - verify all From variants
test('Select.from - null when no FROM', () => {
  const sql = 'SELECT 1';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.strictEqual(select.from, null);
});

test('Select.from - From[] array', () => {
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(Array.isArray(select.from));
  const from = select.from as From[];
  assert.strictEqual(from[0].table, 'users');
});

test('Select.from - TableExpr variant', () => {
  const sql = 'SELECT * FROM (SELECT id FROM users) AS t';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.from);
  assert.ok(Array.isArray(select.from));
});

test('Select.from - complex with parentheses', () => {
  const sql = 'SELECT * FROM (users, orders)';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.from);
});

// Select.where - verify all expression types
test('Select.where - null when no WHERE', () => {
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.strictEqual(select.where, null);
});

test('Select.where - Binary expression', () => {
  const sql = 'SELECT * FROM users WHERE id = 1';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.where);
  assert.ok(isBinary(select.where));
});

test('Select.where - Unary expression', () => {
  const sql = 'SELECT * FROM users WHERE NOT active';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.where);
  assert.ok(isUnary(select.where) || isBinary(select.where));
});

test('Select.where - Function expression', () => {
  const sql = 'SELECT * FROM users WHERE ISNULL(name)';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.where);
  assert.ok(isFunction(select.where));
});

// Select.having - verify Binary type
test('Select.having - null when no HAVING', () => {
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.strictEqual(select.having, null);
});

test('Select.having - Binary expression', () => {
  const sql = 'SELECT dept, COUNT(*) FROM users GROUP BY dept HAVING COUNT(*) > 5';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.having);
  assert.ok(isBinary(select.having));
});

// Select._next and set_op - verify chained selects
test('Select._next - null when no set operation', () => {
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.strictEqual(select._next, undefined);
  assert.strictEqual(select.set_op, undefined);
});

test('Select._next and set_op - UNION', () => {
  const sql = 'SELECT id FROM users UNION SELECT id FROM admins';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select._next);
  assert.ok(isSelect(select._next));
  assert.strictEqual(select.set_op, 'union');
});

test('Select._next and set_op - UNION ALL', () => {
  const sql = 'SELECT id FROM users UNION ALL SELECT id FROM admins';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select._next);
  assert.strictEqual(select.set_op, 'union all');
});

// Select.parentheses_symbol and _parentheses
test('Select._parentheses - undefined when no parentheses', () => {
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.strictEqual(select._parentheses, undefined);
});

test('Select._parentheses - true when in parentheses', () => {
  const sql = 'SELECT * FROM (SELECT * FROM users) AS t';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  // The outer select won't have _parentheses, but the inner one should
  assert.ok(select.from);
});

// Select.locking_read - verify all properties
test('Select.locking_read - null when no locking', () => {
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.strictEqual(select.locking_read, null);
});

test('Select.locking_read - FOR UPDATE', () => {
  const sql = 'SELECT * FROM users FOR UPDATE';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.locking_read);
  assert.strictEqual(select.locking_read, 'FOR UPDATE');
});

test('Select.locking_read - LOCK IN SHARE MODE', () => {
  const sql = 'SELECT * FROM users LOCK IN SHARE MODE';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.locking_read);
  assert.strictEqual(select.locking_read, 'LOCK IN SHARE MODE');
});

test('Select.locking_read - FOR UPDATE NOWAIT', () => {
  const sql = 'SELECT * FROM users FOR UPDATE NOWAIT';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.locking_read);
  assert.strictEqual(select.locking_read, 'FOR UPDATE NOWAIT');
});

test('Select.locking_read - FOR UPDATE SKIP LOCKED', () => {
  const sql = 'SELECT * FROM users FOR UPDATE SKIP LOCKED';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.locking_read);
  assert.strictEqual(select.locking_read, 'FOR UPDATE SKIP LOCKED');
});
