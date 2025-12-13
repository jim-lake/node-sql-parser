import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { TableExpr, Dual, Returning } from '../../types.d.ts';
import { isTableExpr, isDual, isReturning } from './types.guard.ts';

const parser = new Parser();

test('TableExpr - subquery in FROM', () => {
  const sql = 'SELECT * FROM (SELECT id FROM users) AS sub';
  const ast = parser.astify(sql);
  const tableExpr = ast.from![0] as TableExpr;
  
  assert.ok(isTableExpr(tableExpr), 'Should be TableExpr');
  assert.strictEqual(tableExpr.as, 'sub');
  assert.strictEqual(tableExpr.expr.ast.type, 'select');
});

test('Dual - SELECT FROM DUAL', () => {
  const sql = 'SELECT 1 FROM DUAL';
  const ast = parser.astify(sql);
  const dual = ast.from![0] as Dual;
  
  assert.ok(isDual(dual), 'Should be Dual');
  assert.strictEqual(dual.type, 'dual');
});

