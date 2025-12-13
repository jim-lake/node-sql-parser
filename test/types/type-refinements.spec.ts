import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Update, OrderBy, SetList, Value, Column } from '../../types.d.ts';

const parser = new Parser();

test('Value type with string', () => {
  const sql = "SELECT 'hello' FROM dual";
  const ast = parser.astify(sql) as Select;
  
  const col = (ast.columns as Column[])[0];
  const value = col.expr as Value;
  assert.strictEqual(value.type, 'single_quote_string');
  assert.strictEqual(typeof value.value, 'string');
});

test('Value type with number', () => {
  const sql = 'SELECT 42 FROM dual';
  const ast = parser.astify(sql) as Select;
  
  const col = (ast.columns as Column[])[0];
  const value = col.expr as Value;
  assert.strictEqual(value.type, 'number');
  assert.strictEqual(typeof value.value, 'number');
});

test('Value type with boolean', () => {
  const sql = 'SELECT TRUE FROM dual';
  const ast = parser.astify(sql) as Select;
  
  const col = (ast.columns as Column[])[0];
  const value = col.expr as Value;
  assert.strictEqual(value.type, 'bool');
  assert.strictEqual(typeof value.value, 'boolean');
});

test('OrderBy expr type', () => {
  const sql = 'SELECT * FROM users ORDER BY id + 1 DESC';
  const ast = parser.astify(sql) as Select;
  
  const orderby = ast.orderby![0] as OrderBy;
  assert.strictEqual(orderby.type, 'DESC');
  assert.ok(orderby.expr);
});

test('SetList value type', () => {
  const sql = 'UPDATE users SET name = "John", age = 30';
  const ast = parser.astify(sql) as Update;
  
  const setList = ast.set as SetList[];
  assert.ok(Array.isArray(setList));
  assert.ok(setList[0].value);
});
