import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Interval, Param, Var, TableColumnAst, ParseOptions, Option } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('Interval - DATE_ADD with INTERVAL', () => {
  const sql = 'SELECT DATE_ADD(NOW(), INTERVAL 1 DAY)';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
});

test('Param - prepared statement parameter', () => {
  const sql = 'SELECT * FROM users WHERE id = :id';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
});

test('Var - variable reference', () => {
  const sql = 'SELECT @myvar';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
});

test('TableColumnAst - parse result', () => {
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql) as TableColumnAst;
  assert.ok(isSelect(ast), 'ast should be a Select type');
});

test('ParseOptions - with includeLocations', () => {
  const sql = 'SELECT * FROM users';
  const options: ParseOptions = { includeLocations: true };
  const ast = parser.astify(sql, { parseOptions: options });
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
});

test('Option - with database and parseOptions', () => {
  const sql = 'SELECT * FROM users';
  const option: Option = { database: 'MySQL', parseOptions: { includeLocations: true } };
  const ast = parser.astify(sql, option);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
});
