import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, CreateTable, ValueExpr, Binary } from '../../../types.d.ts';
import { isSelect, isCreate } from './types.guard.ts';

const parser = new Parser();

test('LIKE with string literal', () => {
  const sql = 'SELECT * FROM t WHERE name LIKE "test%"';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast));
  const where = (ast as Select).where as Binary;
  assert.strictEqual(where.operator, 'LIKE');
  
  const right = where.right as ValueExpr;
  assert.strictEqual(right.type, 'double_quote_string');
  assert.strictEqual(right.value, 'test%');
});

test('LIKE with single quote string', () => {
  const sql = "SELECT * FROM t WHERE name LIKE 'test%'";
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast));
  const where = (ast as Select).where as Binary;
  const right = where.right as ValueExpr;
  assert.strictEqual(right.type, 'single_quote_string');
  assert.strictEqual(right.value, 'test%');
});

test('LIKE with ESCAPE clause', () => {
  const sql = 'SELECT * FROM t WHERE name LIKE "test\\\\%" ESCAPE "\\\\"';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast));
  const where = (ast as Select).where as Binary;
  const right = where.right as any;
  assert.strictEqual(right.type, 'double_quote_string');
  assert.ok(right.escape);
  assert.strictEqual(right.escape.type, 'ESCAPE');
  assert.strictEqual(right.escape.value.type, 'double_quote_string');
});

test('NOT LIKE with literal', () => {
  const sql = 'SELECT * FROM t WHERE name NOT LIKE "test%"';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast));
  const where = (ast as Select).where as Binary;
  assert.strictEqual(where.operator, 'NOT LIKE');
  
  const right = where.right as ValueExpr;
  assert.strictEqual(right.type, 'double_quote_string');
});

test('GENERATED with number literal', () => {
  const sql = 'CREATE TABLE t (id INT, val INT GENERATED ALWAYS AS (42) STORED)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const createAst = ast as CreateTable;
  const generated = createAst.create_definitions![1].generated!;
  
  assert.strictEqual(generated.type, 'generated');
  const expr = generated.expr as ValueExpr;
  assert.strictEqual(expr.type, 'number');
  assert.strictEqual(expr.value, 42);
  assert.strictEqual(generated.storage_type, 'stored');
});

test('GENERATED with string literal', () => {
  const sql = 'CREATE TABLE t (id INT, val VARCHAR(10) GENERATED ALWAYS AS ("test") VIRTUAL)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const createAst = ast as CreateTable;
  const generated = createAst.create_definitions![1].generated!;
  
  const expr = generated.expr as ValueExpr;
  assert.strictEqual(expr.type, 'double_quote_string');
  assert.strictEqual(expr.value, 'test');
  assert.strictEqual(generated.storage_type, 'virtual');
});

test('GENERATED with NULL literal', () => {
  const sql = 'CREATE TABLE t (id INT, val INT GENERATED ALWAYS AS (NULL))';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const createAst = ast as CreateTable;
  const generated = createAst.create_definitions![1].generated!;
  
  const expr = generated.expr as ValueExpr;
  assert.strictEqual(expr.type, 'null');
  assert.strictEqual(expr.value, null);
});

test('GENERATED with boolean literal TRUE', () => {
  const sql = 'CREATE TABLE t (id INT, val BOOLEAN GENERATED ALWAYS AS (TRUE))';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const createAst = ast as CreateTable;
  const generated = createAst.create_definitions![1].generated!;
  
  const expr = generated.expr as ValueExpr;
  assert.strictEqual(expr.type, 'bool');
  assert.strictEqual(expr.value, true);
});

test('GENERATED with boolean literal FALSE', () => {
  const sql = 'CREATE TABLE t (id INT, val BOOLEAN GENERATED ALWAYS AS (FALSE))';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const createAst = ast as CreateTable;
  const generated = createAst.create_definitions![1].generated!;
  
  const expr = generated.expr as ValueExpr;
  assert.strictEqual(expr.type, 'bool');
  assert.strictEqual(expr.value, false);
});

test('GENERATED with decimal literal', () => {
  const sql = 'CREATE TABLE t (id INT, val DECIMAL GENERATED ALWAYS AS (3.14))';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const createAst = ast as CreateTable;
  const generated = createAst.create_definitions![1].generated!;
  
  const expr = generated.expr as ValueExpr;
  assert.strictEqual(expr.type, 'number');
  assert.strictEqual(expr.value, 3.14);
});

test('GENERATED with expression (not literal)', () => {
  const sql = 'CREATE TABLE t (id INT, val INT GENERATED ALWAYS AS (id * 2))';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const createAst = ast as CreateTable;
  const generated = createAst.create_definitions![1].generated!;
  
  const expr = generated.expr as Binary;
  assert.strictEqual(expr.type, 'binary_expr');
  assert.strictEqual(expr.operator, '*');
});

test('GENERATED without ALWAYS keyword', () => {
  const sql = 'CREATE TABLE t (id INT, val INT AS (100) STORED)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const createAst = ast as CreateTable;
  const generated = createAst.create_definitions![1].generated!;
  
  const expr = generated.expr as ValueExpr;
  assert.strictEqual(expr.type, 'number');
  assert.strictEqual(expr.value, 100);
});
