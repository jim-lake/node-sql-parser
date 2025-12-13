import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, AST, WindowExpr, NamedWindowExpr, From } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('Multiple statements return AST array', () => {
  const sql = 'SELECT 1; SELECT 2;';
  const ast = parser.astify(sql);
  
  assert.ok(Array.isArray(ast), 'Multiple statements should return an array');
  assert.strictEqual(ast.length, 2);
  assert.ok(isSelect(ast[0]));
  assert.ok(isSelect(ast[1]));
});

test('Named window expression in WINDOW clause', () => {
  const sql = 'SELECT id, ROW_NUMBER() OVER w FROM t WINDOW w AS (ORDER BY id)';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  assert.ok(ast.window, 'Should have window clause');
  assert.strictEqual(ast.window.keyword, 'window');
  assert.strictEqual(ast.window.type, 'window');
  assert.ok(Array.isArray(ast.window.expr));
  
  const namedWindow = ast.window.expr[0];
  assert.strictEqual(namedWindow.name, 'w');
  assert.ok(typeof namedWindow.as_window_specification === 'object');
  assert.ok('window_specification' in namedWindow.as_window_specification);
});

test('Window function references named window by string', () => {
  const sql = 'SELECT ROW_NUMBER() OVER w FROM t WINDOW w AS (ORDER BY id)';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  const col = ast.columns[0];
  assert.strictEqual(col.expr.type, 'function');
  
  if (col.expr.type === 'function') {
    assert.ok(col.expr.over);
    assert.strictEqual(col.expr.over.type, 'window');
    assert.strictEqual(typeof col.expr.over.as_window_specification, 'string');
    assert.strictEqual(col.expr.over.as_window_specification, 'w');
  }
});

test('Complex FROM with parentheses', () => {
  const sql = 'SELECT * FROM (t1, t2)';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  assert.ok(typeof ast.from === 'object' && !Array.isArray(ast.from));
  
  if (typeof ast.from === 'object' && !Array.isArray(ast.from) && 'expr' in ast.from) {
    assert.ok(Array.isArray(ast.from.expr));
    assert.strictEqual(ast.from.expr.length, 2);
    assert.ok('parentheses' in ast.from);
    assert.strictEqual(ast.from.parentheses.length, 1);
    assert.ok(Array.isArray(ast.from.joins));
  }
});

test('Set operation with UNION', () => {
  const sql = 'SELECT 1 UNION SELECT 2';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  assert.strictEqual(ast.set_op, 'union');
  assert.ok(ast._next);
  assert.ok(isSelect(ast._next));
});

test('CREATE INDEX with algorithm and lock options', () => {
  const sql = 'CREATE INDEX idx ON t (id) ALGORITHM = INPLACE LOCK = NONE';
  const ast = parser.astify(sql);
  
  assert.strictEqual(ast.type, 'create');
  assert.strictEqual(ast.keyword, 'index');
  assert.ok(ast.algorithm_option);
  assert.strictEqual(ast.algorithm_option.keyword, 'algorithm');
  assert.strictEqual(ast.algorithm_option.algorithm, 'INPLACE');
  assert.ok(ast.lock_option);
  assert.strictEqual(ast.lock_option.keyword, 'lock');
  assert.strictEqual(ast.lock_option.lock, 'NONE');
});
