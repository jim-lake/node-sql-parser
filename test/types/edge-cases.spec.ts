import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Insert_Replace, Alter, Lock, Create } from '../../types.d.ts';
import { isSelect, isBinary } from './types.guard.ts';

const parser = new Parser();

test('Select with INTO has full structure', () => {
  const sql = 'SELECT id INTO @var FROM t';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  assert.ok(ast.into);
  assert.strictEqual(ast.into.keyword, 'var');
  assert.strictEqual(ast.into.type, 'into');
  assert.ok(Array.isArray(ast.into.expr));
  assert.strictEqual(ast.into.position, 'column');
});

test('Select with HAVING is Binary not array', () => {
  const sql = 'SELECT COUNT(*) FROM t GROUP BY id HAVING COUNT(*) > 1';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  assert.ok(ast.having);
  assert.ok(isBinary(ast.having));
  assert.strictEqual(ast.having.operator, '>');
});

test('Insert with PARTITION is string array', () => {
  const sql = 'INSERT INTO t PARTITION (p0) VALUES (1)';
  const ast = parser.astify(sql) as Insert_Replace;
  
  assert.strictEqual(ast.type, 'insert');
  assert.ok(Array.isArray(ast.partition));
  assert.strictEqual(ast.partition[0], 'p0');
});

test('Alter expr is an array', () => {
  const sql = 'ALTER TABLE t ADD COLUMN c INT';
  const ast = parser.astify(sql) as Alter;
  
  assert.strictEqual(ast.type, 'alter');
  assert.ok(Array.isArray(ast.expr));
  assert.strictEqual(ast.expr[0].action, 'add');
  assert.strictEqual(ast.expr[0].keyword, 'COLUMN');
});

test('Lock tables has object lock_type', () => {
  const sql = 'LOCK TABLES t1 READ, t2 WRITE';
  const ast = parser.astify(sql) as Lock;
  
  assert.strictEqual(ast.type, 'lock');
  assert.ok(Array.isArray(ast.tables));
  assert.strictEqual(ast.tables.length, 2);
  assert.strictEqual(typeof ast.tables[0].lock_type, 'object');
  assert.strictEqual(ast.tables[0].lock_type.type, 'read');
  assert.strictEqual(ast.tables[1].lock_type.type, 'write');
});

test('Create table LIKE has From array', () => {
  const sql = 'CREATE TABLE t2 LIKE t1';
  const ast = parser.astify(sql) as Create;
  
  assert.strictEqual(ast.type, 'create');
  assert.ok(ast.like);
  assert.strictEqual(ast.like.type, 'like');
  assert.ok(Array.isArray(ast.like.table));
  assert.strictEqual(ast.like.table[0].table, 't1');
});

test('Create view with DEFINER is Binary', () => {
  const sql = "CREATE DEFINER = 'user'@'host' VIEW v AS SELECT 1";
  const ast = parser.astify(sql) as Create;
  
  assert.strictEqual(ast.type, 'create');
  assert.ok(ast.definer);
  assert.ok(isBinary(ast.definer));
  assert.strictEqual(ast.definer.operator, '=');
});

test('Select with GROUP BY modifiers', () => {
  const sql = 'SELECT COUNT(*) FROM t GROUP BY id WITH ROLLUP';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  assert.ok(ast.groupby);
  assert.ok(Array.isArray(ast.groupby.modifiers));
  assert.strictEqual(ast.groupby.modifiers[0].type, 'origin');
  assert.strictEqual(ast.groupby.modifiers[0].value, 'with rollup');
});
