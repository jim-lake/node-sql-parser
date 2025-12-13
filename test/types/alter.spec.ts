import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Alter, AlterExpr } from '../../types.d.ts';
import { isAlter } from './types.guard.ts';

const parser = new Parser();

test('ALTER TABLE - expr is AlterExpr type', () => {
  const sql = 'ALTER TABLE users ADD COLUMN email VARCHAR(255)';
  const ast = parser.astify(sql);
  
  assert.ok(isAlter(ast), 'AST should be an Alter type');
  const alterAst = ast as Alter;
  assert.strictEqual(alterAst.type, 'alter');
  const expr = alterAst.expr as AlterExpr;
  assert.ok(expr);
  assert.ok(typeof expr === 'object');
});

