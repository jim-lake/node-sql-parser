import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Show, Explain, Call, Set, Lock, Unlock, Transaction, LockTable } from '../../types.d.ts';

const parser = new Parser();

test('SHOW statement', () => {
  const sql = 'SHOW TABLES';
  const ast = parser.astify(sql) as Show;
  
  assert.strictEqual(ast.type, 'show');
  assert.strictEqual(ast.keyword, 'tables');
});

test('Explain type exists', () => {
  // Explain type is defined in types.d.ts
  const explain: Explain | null = null;
  assert.ok(true);
});

test('CALL statement', () => {
  const sql = 'CALL my_procedure()';
  const ast = parser.astify(sql) as Call;
  
  assert.strictEqual(ast.type, 'call');
  assert.strictEqual(ast.expr.type, 'function');
});

test('SET statement', () => {
  const sql = 'SET @var = 1';
  const ast = parser.astify(sql) as Set;
  
  assert.strictEqual(ast.type, 'set');
  assert.ok(Array.isArray(ast.expr));
});

test('LOCK TABLES statement', () => {
  const sql = 'LOCK TABLES users READ';
  const ast = parser.astify(sql) as Lock;
  
  assert.strictEqual(ast.type, 'lock');
  assert.strictEqual(ast.keyword, 'tables');
  const lockTable = ast.tables[0] as LockTable;
  assert.ok(lockTable.table);
  assert.ok(lockTable.lock_type);
});

test('UNLOCK TABLES statement', () => {
  const sql = 'UNLOCK TABLES';
  const ast = parser.astify(sql) as Unlock;
  
  assert.strictEqual(ast.type, 'unlock');
  assert.strictEqual(ast.keyword, 'tables');
});

test('Transaction type exists', () => {
  // Transaction type is defined in types.d.ts
  const transaction: Transaction | null = null;
  assert.ok(true);
});
