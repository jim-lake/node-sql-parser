import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Interval, Param, ValueExpr, ColumnRef, Function as FuncType } from '../../types.d.ts';
import { isInterval, isParam, isValueExpr, isSelect, isColumnRef } from './types.guard.ts';

const parser = new Parser();

test('Interval expression', () => {
  const sql = "SELECT DATE_ADD('2020-01-01', INTERVAL 1 DAY)";
  const ast = parser.astify(sql);
  assert(isSelect(ast));
  const col = ast.columns[0];
  const func = col.expr as any;
  const intervalArg = func.args.value[1];
  assert(isInterval(intervalArg));
});

test('Param expression', () => {
  const sql = "SELECT * FROM t WHERE id = :id";
  const ast = parser.astify(sql);
  assert(isSelect(ast));
  const where = ast.where as any;
  assert(isParam(where.right));
});

test('Column ref with star', () => {
  const sql = "SELECT * FROM t";
  const ast = parser.astify(sql);
  assert(isSelect(ast));
  const col = ast.columns[0];
  assert(isColumnRef(col.expr));
  const colRef = col.expr as ColumnRef;
  if ('column' in colRef) {
  }
});

test('ValueExpr type - string', () => {
  const sql = "SELECT 'hello'";
  const ast = parser.astify(sql);
  assert(isSelect(ast));
  const col = ast.columns[0];
  assert(isValueExpr(col.expr));
});

test('ValueExpr type - number', () => {
  const sql = "SELECT 42";
  const ast = parser.astify(sql);
  assert(isSelect(ast));
  const col = ast.columns[0];
  assert(isValueExpr(col.expr));
});

test('ValueExpr type - boolean', () => {
  const sql = "SELECT TRUE";
  const ast = parser.astify(sql);
  assert(isSelect(ast));
  const col = ast.columns[0];
  assert(isValueExpr(col.expr));
});

test('ValueExpr type - null', () => {
  const sql = "SELECT NULL";
  const ast = parser.astify(sql);
  assert(isSelect(ast));
  const col = ast.columns[0];
  assert(isValueExpr(col.expr));
});
