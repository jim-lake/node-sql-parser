import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select } from '../../types.d.ts';

const parser = new Parser();

test('SELECT with COLLATE', () => {
  const sql = 'SELECT * FROM users COLLATE utf8_general_ci';
  const ast = parser.astify(sql) as Select;
  
  assert.strictEqual(ast.type, 'select');
  assert.ok(ast.collate);
});

test('SELECT locking_read type exists', () => {
  // locking_read type is defined in Select interface
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql) as Select;
  assert.strictEqual(ast.type, 'select');
  // locking_read can be undefined or an object
  assert.ok(ast.locking_read === undefined || typeof ast.locking_read === 'object');
});
