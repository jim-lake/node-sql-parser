import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Function, FunctionName, ExprList, OnUpdateCurrentTimestamp, AsWindowSpec, CreateTable, AggrFunc } from '../../../types.d.ts';
import { isSelect, isFunction, isExprList, isCreateTable, isAggrFunc } from './types.guard.ts';

const parser = new Parser();

// Phase 11.9: Function Properties

test('Function.name - FunctionName structure with name array', () => {
  const sql = 'SELECT UPPER(name) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  assert.strictEqual(func.type, 'function');
  
  // Verify FunctionName structure
  const funcName = func.name as FunctionName;
  assert.ok(funcName.name, 'FunctionName should have name property');
  assert.ok(Array.isArray(funcName.name), 'FunctionName.name should be an array');
  assert.ok(funcName.name.length > 0, 'FunctionName.name should not be empty');
  assert.strictEqual(funcName.name[0].type, 'default');
  assert.strictEqual(funcName.name[0].value, 'UPPER');
});

test('Function.name - FunctionName with schema property', () => {
  const sql = 'SELECT mydb.UPPER(name) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
  const funcName = func.name as FunctionName;
  assert.ok(funcName.schema, 'Schema-qualified function should have schema property');
  assert.strictEqual(funcName.schema.type, 'default');
  assert.strictEqual(funcName.schema.value, 'mydb');
  assert.ok(Array.isArray(funcName.name));
  assert.strictEqual(funcName.name[0].value, 'UPPER');
});

test('Function.args - ExprList with single argument', () => {
  const sql = 'SELECT UPPER(name) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
  // Verify args is ExprList
  assert.ok(func.args, 'Function should have args property');
  const args = func.args as ExprList;
  assert.ok(isExprList(args), 'Function.args should be ExprList type');
  assert.strictEqual(args.type, 'expr_list');
  assert.ok(Array.isArray(args.value));
  assert.strictEqual(args.value.length, 1);
});

test('Function.args - ExprList with multiple arguments', () => {
  const sql = 'SELECT CONCAT(first, last) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
  const args = func.args as ExprList;
  assert.ok(isExprList(args));
  assert.strictEqual(args.value.length, 2);
});

test('Function.args - ExprList with empty array (no arguments)', () => {
  const sql = 'SELECT NOW() FROM dual';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
  const args = func.args as ExprList;
  assert.ok(isExprList(args));
  assert.strictEqual(args.type, 'expr_list');
  assert.ok(Array.isArray(args.value));
  assert.strictEqual(args.value.length, 0, 'Function with no args should have empty array');
});

test('Function.over - OnUpdateCurrentTimestamp type', () => {
  const sql = 'CREATE TABLE t (updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)';
  const ast = parser.astify(sql);
  
  // Direct check without type guard
  assert.strictEqual(ast.type, 'create');
  assert.strictEqual(ast.keyword, 'table');
  assert.ok(ast.create_definitions);
  
  const defaultVal = ast.create_definitions[0].default_val;
  assert.ok(defaultVal);
  assert.strictEqual(defaultVal.type, 'default');
  
  const func = defaultVal.value;
  assert.strictEqual(func.type, 'function');
  
  // Verify over is OnUpdateCurrentTimestamp (not suffix!)
  assert.ok(func.over, 'Function with ON UPDATE should have over property');
  const onUpdate = func.over;
  assert.strictEqual(onUpdate.type, 'on update');
  assert.strictEqual(onUpdate.keyword, 'CURRENT_TIMESTAMP');
  assert.strictEqual(onUpdate.parentheses, false);
  assert.strictEqual(onUpdate.expr, null);
});

test('Function.over - null when no ON UPDATE or window', () => {
  const sql = 'SELECT UPPER(name) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
  // Regular functions should have null over property
  assert.strictEqual(func.over, null);
});

test('Function.over - window specification with AsWindowSpec', () => {
  const sql = 'SELECT ROW_NUMBER() OVER (ORDER BY id) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
  // Verify over property
  assert.ok(func.over, 'Window function should have over property');
  assert.strictEqual(func.over.type, 'window');
  
  const asWindowSpec = func.over.as_window_specification as AsWindowSpec;
  assert.ok(asWindowSpec, 'over should have as_window_specification');
  assert.ok('window_specification' in asWindowSpec || 'name' in asWindowSpec);
});

test('Function.over - null for non-window functions', () => {
  const sql = 'SELECT CONCAT(first, last) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
  assert.strictEqual(func.over, null, 'Non-window function should have null over');
});

test('Function - all properties together (window function)', () => {
  const sql = 'SELECT ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary) FROM employees';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const func = (ast as Select).columns[0].expr as Function;
  assert.ok(isFunction(func));
  
  // Verify all properties exist
  assert.strictEqual(func.type, 'function');
  assert.ok(func.name);
  assert.ok(func.args);
  assert.ok(func.over);
  
  // name is FunctionName
  assert.ok(Array.isArray(func.name.name));
  
  // args is ExprList
  assert.ok(isExprList(func.args));
  
  // over has window specification
  assert.strictEqual(func.over.type, 'window');
});

test('Function vs AggrFunc - COUNT is aggr_func not function', () => {
  const sql = 'SELECT COUNT(*) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const expr = (ast as Select).columns[0].expr;
  
  // COUNT(*) is an aggr_func, not a function
  assert.ok(isAggrFunc(expr), 'COUNT should be aggr_func type');
  assert.strictEqual(expr.type, 'aggr_func');
});
