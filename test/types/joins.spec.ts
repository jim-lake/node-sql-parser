import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Join, From } from '../../types.d.ts';

const parser = new Parser();

test('SELECT with INNER JOIN', () => {
  const sql = 'SELECT * FROM users INNER JOIN orders ON users.id = orders.user_id';
  const ast = parser.astify(sql) as Select;
  
  assert.strictEqual(ast.type, 'select');
  assert.ok(Array.isArray(ast.from));
  const from = ast.from as From[];
  assert.strictEqual(from.length, 2);
  const join = from[1] as Join;
  assert.strictEqual(join.join, 'INNER JOIN');
  assert.ok(join.on);
});

test('SELECT with LEFT JOIN', () => {
  const sql = 'SELECT * FROM users LEFT JOIN orders ON users.id = orders.user_id';
  const ast = parser.astify(sql) as Select;
  
  assert.strictEqual(ast.type, 'select');
  const from = ast.from as From[];
  const join = from[1] as Join;
  assert.strictEqual(join.join, 'LEFT JOIN');
});

test('SELECT with RIGHT JOIN', () => {
  const sql = 'SELECT * FROM users RIGHT JOIN orders ON users.id = orders.user_id';
  const ast = parser.astify(sql) as Select;
  
  assert.strictEqual(ast.type, 'select');
  const from = ast.from as From[];
  const join = from[1] as Join;
  assert.strictEqual(join.join, 'RIGHT JOIN');
});
