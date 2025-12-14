import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, AggrFunc } from '../../../types.d.ts';
import { isSelect, isAggrFunc } from './types.guard.ts';

const parser = new Parser();

// Phase 11.10: AggrFunc Properties Complete Validation

test('AggrFunc.name - string value', () => {
  const sql = 'SELECT COUNT(*) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.strictEqual(typeof aggr.name, 'string');
  assert.strictEqual(aggr.name, 'COUNT');
});

test('AggrFunc.name - all aggregate function names', () => {
  const functions = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'GROUP_CONCAT'];
  for (const fn of functions) {
    const sql = `SELECT ${fn}(id) FROM users`;
    const ast = parser.astify(sql);
    assert.ok(isSelect(ast));
    const col = (ast as Select).columns[0];
    assert.ok(isAggrFunc(col.expr));
    const aggr = col.expr as AggrFunc;
    assert.strictEqual(aggr.name, fn);
  }
});

test('AggrFunc.args.expr - ExpressionValue', () => {
  const sql = 'SELECT COUNT(user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.ok(aggr.args.expr);
  assert.strictEqual(aggr.args.expr.type, 'column_ref');
});

test('AggrFunc.args.expr - star expression', () => {
  const sql = 'SELECT COUNT(*) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.ok(aggr.args.expr);
  assert.strictEqual(aggr.args.expr.type, 'star');
  assert.strictEqual(aggr.args.expr.value, '*');
});

test('AggrFunc.args.distinct - DISTINCT present', () => {
  const sql = 'SELECT COUNT(DISTINCT user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.strictEqual(aggr.args.distinct, 'DISTINCT');
});

test('AggrFunc.args.distinct - null when not present', () => {
  const sql = 'SELECT COUNT(user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.ok(aggr.args.distinct === null || aggr.args.distinct === undefined);
});

test('AggrFunc.args.orderby - OrderBy[] present', () => {
  const sql = 'SELECT GROUP_CONCAT(name ORDER BY name ASC) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.ok(aggr.args.orderby);
  assert.ok(Array.isArray(aggr.args.orderby));
  assert.strictEqual(aggr.args.orderby.length, 1);
  assert.strictEqual(aggr.args.orderby[0].type, 'ASC');
});

test('AggrFunc.args.orderby - null when not present', () => {
  const sql = 'SELECT COUNT(user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.ok(aggr.args.orderby === null || aggr.args.orderby === undefined);
});

test('AggrFunc.args.parentheses - boolean (always true for function calls)', () => {
  const sql = 'SELECT COUNT(user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  // parentheses property may not be present or may be true
  assert.ok(aggr.args.parentheses === undefined || aggr.args.parentheses === true);
});

test('AggrFunc.args.separator - object variant with keyword and value', () => {
  const sql = "SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM users";
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.ok(aggr.args.separator);
  assert.strictEqual(typeof aggr.args.separator, 'object');
  if (typeof aggr.args.separator === 'object' && aggr.args.separator !== null) {
    assert.ok('keyword' in aggr.args.separator);
    assert.ok('value' in aggr.args.separator);
    assert.strictEqual(aggr.args.separator.keyword, 'SEPARATOR');
  }
});

test('AggrFunc.args.separator - null when not present', () => {
  const sql = 'SELECT GROUP_CONCAT(name) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.ok(aggr.args.separator === null || aggr.args.separator === undefined);
});

test('AggrFunc.over - window specification present', () => {
  const sql = 'SELECT SUM(amount) OVER (PARTITION BY user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.ok(aggr.over);
  assert.strictEqual(aggr.over.type, 'window');
  assert.ok(aggr.over.as_window_specification);
});

test('AggrFunc.over - null when not present', () => {
  const sql = 'SELECT COUNT(user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  assert.strictEqual(aggr.over, null);
});

test('AggrFunc - all properties combined', () => {
  const sql = "SELECT GROUP_CONCAT(DISTINCT name ORDER BY name DESC SEPARATOR '|') OVER (PARTITION BY category) FROM products";
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  
  // Verify all properties
  assert.strictEqual(aggr.type, 'aggr_func');
  assert.strictEqual(aggr.name, 'GROUP_CONCAT');
  assert.ok(aggr.args.expr);
  assert.strictEqual(aggr.args.distinct, 'DISTINCT');
  assert.ok(aggr.args.orderby);
  assert.ok(aggr.args.separator);
  assert.ok(aggr.over);
  assert.strictEqual(aggr.over.type, 'window');
});
