import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import { ParserPostgres } from './parser-loader-postgres.mjs';
import type { TableExpr, Dual, Returning } from '../../types.d.ts';
import { isTableExpr, isDual, isReturning } from './types.guard.ts';

const parser = new Parser();
const parserPg = new ParserPostgres();

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

test('Returning - INSERT with RETURNING', () => {
  const sql = "INSERT INTO users (name) VALUES ('John') RETURNING id";
  const ast = parserPg.astify(sql);
  
  assert.ok(ast.returning, 'Should have returning');
  assert.ok(isReturning(ast.returning), 'Should be Returning type');
  assert.strictEqual(ast.returning.type, 'returning');
  assert.ok(Array.isArray(ast.returning.columns));
});

test('Returning - UPDATE with RETURNING', () => {
  const sql = "UPDATE users SET name = 'Jane' WHERE id = 1 RETURNING *";
  const ast = parserPg.astify(sql);
  
  assert.ok(ast.returning, 'Should have returning');
  assert.ok(isReturning(ast.returning), 'Should be Returning type');
});

test('Returning - DELETE with RETURNING', () => {
  const sql = "DELETE FROM users WHERE id = 1 RETURNING id, name";
  const ast = parserPg.astify(sql);
  
  assert.ok(ast.returning, 'Should have returning');
  assert.ok(isReturning(ast.returning), 'Should be Returning type');
});
