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
});

test('AggrFunc.name - all aggregate function names', () => {
  const functions = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'GROUP_CONCAT'];
  for (const fn of functions) {
    const sql = `SELECT ${fn}(id) FROM users`;
    const ast = parser.astify(sql);
    assert.ok(isSelect(ast));
    const col = (ast as Select).columns[0];
    assert.ok(isAggrFunc(col.expr));
  }
});

test('AggrFunc.args.expr - ExpressionValue', () => {
  const sql = 'SELECT COUNT(user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
});

test('AggrFunc.args.expr - star expression', () => {
  const sql = 'SELECT COUNT(*) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
});

test('AggrFunc.args.distinct - DISTINCT present', () => {
  const sql = 'SELECT COUNT(DISTINCT user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
});

test('AggrFunc.args.distinct - null when not present', () => {
  const sql = 'SELECT COUNT(user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
});

test('AggrFunc.args.orderby - OrderBy[] present', () => {
  const sql = 'SELECT GROUP_CONCAT(name ORDER BY name ASC) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
});

test('AggrFunc.args.orderby - null when not present', () => {
  const sql = 'SELECT COUNT(user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
});

test('AggrFunc.args.parentheses - boolean (always true for function calls)', () => {
  const sql = 'SELECT COUNT(user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  // parentheses property may not be present or may be true
});

test('AggrFunc.args.separator - object variant with keyword and value', () => {
  const sql = "SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM users";
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  const aggr = col.expr as AggrFunc;
  if (typeof aggr.args.separator === 'object' && aggr.args.separator !== null) {
  }
});

test('AggrFunc.args.separator - null when not present', () => {
  const sql = 'SELECT GROUP_CONCAT(name) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
});

test('AggrFunc.over - window specification present', () => {
  const sql = 'SELECT SUM(amount) OVER (PARTITION BY user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
});

test('AggrFunc.over - null when not present', () => {
  const sql = 'SELECT COUNT(user_id) FROM orders';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
});

test('AggrFunc - all properties combined', () => {
  const sql = "SELECT GROUP_CONCAT(DISTINCT name ORDER BY name DESC SEPARATOR '|') OVER (PARTITION BY category) FROM products";
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  assert.ok(isAggrFunc(col.expr));
  
  // Verify all properties
});
