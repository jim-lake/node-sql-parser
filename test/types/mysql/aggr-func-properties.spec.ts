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
  assert.strictEqual(aggr.type, 'aggr_func');
  assert.strictEqual(aggr.args.distinct, 'DISTINCT');
});

test('AggrFunc - without DISTINCT', () => {
  const sql = 'SELECT COUNT(user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  const col = select.columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.strictEqual(aggr.type, 'aggr_func');
  assert.ok(aggr.args.distinct === null || aggr.args.distinct === undefined);
});

test('AggrFunc - with ORDER BY (GROUP_CONCAT)', () => {
  const sql = 'SELECT GROUP_CONCAT(name ORDER BY name ASC) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  const col = select.columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.strictEqual(aggr.name, 'GROUP_CONCAT');
  assert.ok(aggr.args.orderby);
  assert.ok(Array.isArray(aggr.args.orderby));
  assert.strictEqual(aggr.args.orderby.length, 1);
});

test('AggrFunc - with SEPARATOR (GROUP_CONCAT)', () => {
  const sql = "SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM users";
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  const col = select.columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.strictEqual(aggr.name, 'GROUP_CONCAT');
  assert.ok(aggr.args.separator);
});

test('AggrFunc - with DISTINCT, ORDER BY, and SEPARATOR', () => {
  const sql = "SELECT GROUP_CONCAT(DISTINCT name ORDER BY name SEPARATOR ', ') FROM users";
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  const col = select.columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.strictEqual(aggr.name, 'GROUP_CONCAT');
  assert.strictEqual(aggr.args.distinct, 'DISTINCT');
  assert.ok(aggr.args.orderby);
  assert.ok(aggr.args.separator);
});

test('AggrFunc - with OVER clause', () => {
  const sql = 'SELECT SUM(amount) OVER (PARTITION BY user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  const col = select.columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.ok(aggr.over);
  assert.strictEqual(aggr.over.type, 'window');
});
