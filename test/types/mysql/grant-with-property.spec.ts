import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Grant, ValueExpr } from '../../../types.d.ts';
import { isGrant } from './types.guard.ts';

const parser = new Parser();

test('Grant.with - verify ValueExpr | null', () => {
  // Test with WITH GRANT OPTION
  const sql1 = 'GRANT SELECT ON mydb.* TO user1 WITH GRANT OPTION';
  const ast1 = parser.astify(sql1) as Grant;
  
  assert.ok(isGrant(ast1));
  assert.ok(ast1.with);
  assert.strictEqual(ast1.with.type, 'origin');
  assert.strictEqual(ast1.with.value, 'with grant option');
  
  // Test without WITH clause
  const sql2 = 'GRANT SELECT ON mydb.* TO user1';
  const ast2 = parser.astify(sql2) as Grant;
  
  assert.ok(isGrant(ast2));
  assert.strictEqual(ast2.with, null);
});
