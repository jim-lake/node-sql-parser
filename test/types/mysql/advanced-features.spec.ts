import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, AST } from '../../../types.d.ts';
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
