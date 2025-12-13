import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Drop } from '../../types.d.ts';

const parser = new Parser();

test('DROP TABLE', () => {
  const sql = 'DROP TABLE users';
  const ast = parser.astify(sql) as Drop;
  
  assert.strictEqual(ast.type, 'drop');
  assert.strictEqual(ast.keyword, 'table');
  assert.ok(Array.isArray(ast.name));
});

test('DROP TABLE IF EXISTS', () => {
  const sql = 'DROP TABLE IF EXISTS users';
  const ast = parser.astify(sql) as Drop;
  
  assert.strictEqual(ast.type, 'drop');
  assert.strictEqual(ast.prefix, 'if exists');
});
