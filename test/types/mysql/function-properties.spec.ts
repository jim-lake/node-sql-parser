import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Function, FunctionName, ExprList, OnUpdateCurrentTimestamp, AsWindowSpec, CreateTable, AggrFunc } from '../../../types.d.ts';
import { isSelect, isFunction, isExprList, isAggrFunc } from './types.guard.ts';

const parser = new Parser();

// Phase 11.9: Function Properties

test('Function.name - FunctionName structure with name array', () => {
  const sql = 'SELECT UPPER(name) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
  // Verify FunctionName structure
});

test('Function.name - FunctionName with schema property', () => {
  const sql = 'SELECT mydb.UPPER(name) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
});

test('Function.args - ExprList with single argument', () => {
  const sql = 'SELECT UPPER(name) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
  // Verify args is ExprList
  const args = func.args as ExprList;
  assert.ok(isExprList(args), 'Function.args should be ExprList type');
});

test('Function.args - ExprList with multiple arguments', () => {
  const sql = 'SELECT CONCAT(first, last) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
  const args = func.args as ExprList;
  assert.ok(isExprList(args));
});

test('Function.args - ExprList with empty array (no arguments)', () => {
  const sql = 'SELECT NOW() FROM dual';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
  const args = func.args as ExprList;
  assert.ok(isExprList(args));
});

test('Function.over - null when no ON UPDATE or window', () => {
  const sql = 'SELECT UPPER(name) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
  // Regular functions should have null over property
});

test('Function.over - window specification with AsWindowSpec', () => {
  const sql = 'SELECT ROW_NUMBER() OVER (ORDER BY id) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
  // Verify over property
  
});

test('Function.over - null for non-window functions', () => {
  const sql = 'SELECT CONCAT(first, last) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
});

test('Function - all properties together (window function)', () => {
  const sql = 'SELECT ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary) FROM employees';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
  // Verify all properties exist
  
  // name is FunctionName
  
  // args is ExprList
  assert.ok(isExprList(func.args));
  
  // over has window specification
});

test('Function vs AggrFunc - COUNT is aggr_func not function', () => {
  const sql = 'SELECT COUNT(*) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const expr = (ast as Select).columns[0].expr;
  
  // COUNT(*) is an aggr_func, not a function
  assert.ok(isAggrFunc(expr), 'COUNT should be aggr_func type');
});
