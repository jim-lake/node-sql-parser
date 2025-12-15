import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, AggrFunc } from '../../../types.d.ts';
import { isSelect, isAggrFunc } from './types.guard.ts';

const parser = new Parser();

test('AggrFunc - with DISTINCT', () => {
  const sql = 'SELECT COUNT(DISTINCT user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  const col = select.columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
});

test('AggrFunc - without DISTINCT', () => {
  const sql = 'SELECT COUNT(user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  const col = select.columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
});

test('AggrFunc - with ORDER BY (GROUP_CONCAT)', () => {
  const sql = 'SELECT GROUP_CONCAT(name ORDER BY name ASC) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  const col = select.columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
});

test('AggrFunc - with SEPARATOR (GROUP_CONCAT)', () => {
  const sql = "SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM users";
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  const col = select.columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
});

test('AggrFunc - with DISTINCT, ORDER BY, and SEPARATOR', () => {
  const sql = "SELECT GROUP_CONCAT(DISTINCT name ORDER BY name SEPARATOR ', ') FROM users";
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  const col = select.columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
});

test('AggrFunc - with OVER clause', () => {
  const sql = 'SELECT SUM(amount) OVER (PARTITION BY user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  const col = select.columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
});
