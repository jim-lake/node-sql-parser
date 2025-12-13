import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Insert_Replace, Delete, From } from '../../types.d.ts';

const parser = new Parser();

test('INSERT with ON DUPLICATE KEY UPDATE', () => {
  const sql = 'INSERT INTO users (id, name) VALUES (1, "John") ON DUPLICATE KEY UPDATE name = "Jane"';
  const ast = parser.astify(sql) as Insert_Replace;
  
  assert.strictEqual(ast.type, 'insert');
  assert.ok(ast.on_duplicate_update);
  assert.strictEqual(ast.on_duplicate_update.keyword, 'on duplicate key update');
  assert.ok(Array.isArray(ast.on_duplicate_update.set));
});

test('INSERT with SET', () => {
  const sql = 'INSERT INTO users SET name = "John", email = "john@example.com"';
  const ast = parser.astify(sql) as Insert_Replace;
  
  assert.strictEqual(ast.type, 'insert');
  assert.ok(ast.set);
  assert.ok(Array.isArray(ast.set));
});

test('DELETE with table addition flag', () => {
  const sql = 'DELETE t1 FROM users t1 JOIN orders t2 ON t1.id = t2.user_id';
  const ast = parser.astify(sql) as Delete;
  
  assert.strictEqual(ast.type, 'delete');
  assert.ok(Array.isArray(ast.table));
  const table = ast.table![0] as From & { addition?: boolean };
  assert.ok(table);
});
