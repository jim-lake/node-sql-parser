import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Interval, Param, Var, TableColumnAst, ParseOptions, Option } from '../../types.d.ts';

const parser = new Parser();

test('Interval - DATE_ADD with INTERVAL', () => {
  const sql = 'SELECT DATE_ADD(NOW(), INTERVAL 1 DAY)';
  const ast = parser.astify(sql) as Select;
  
  console.log('Interval:', JSON.stringify(ast, null, 2));
  // Check if interval type exists in the AST
});

test('Param - prepared statement parameter', () => {
  const sql = 'SELECT * FROM users WHERE id = :id';
  const ast = parser.astify(sql) as Select;
  
  console.log('Param:', JSON.stringify(ast, null, 2));
  // Check if param type exists
});

test('Var - variable reference', () => {
  const sql = 'SELECT @myvar';
  const ast = parser.astify(sql) as Select;
  
  console.log('Var:', JSON.stringify(ast, null, 2));
  // Check if var type exists
});

test('TableColumnAst - parse result', () => {
  const sql = 'SELECT * FROM users';
  const result = parser.parse(sql) as TableColumnAst;
  
  console.log('TableColumnAst:', JSON.stringify(result, null, 2));
  assert.strictEqual('tableList' in result, true, 'tableList should be present');
  assert.strictEqual('columnList' in result, true, 'columnList should be present');
  assert.strictEqual('ast' in result, true, 'ast should be present');
  // parentheses and loc are optional
});

test('ParseOptions - type check', () => {
  const options: ParseOptions = { includeLocations: true };
  assert.ok(options);
});

test('Option - type check', () => {
  const option: Option = { database: 'MySQL', parseOptions: { includeLocations: true } };
  assert.ok(option);
});
