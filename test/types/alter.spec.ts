import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Alter, AlterExpr } from '../../types.d.ts';

const parser = new Parser();

test('ALTER TABLE - expr is AlterExpr type', () => {
  const sql = 'ALTER TABLE users ADD COLUMN email VARCHAR(255)';
  const ast = parser.astify(sql) as Alter;
  
  assert.strictEqual(ast.type, 'alter');
  const expr = ast.expr as AlterExpr;
  assert.ok(expr);
  assert.ok(typeof expr === 'object');
});

