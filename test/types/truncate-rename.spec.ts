import { describe, test } from 'node:test';
import assert from 'node:assert';
import mysql from '../../build/mysql.js';
import { isTruncate, isRename } from './types.guard.js';

const { parse } = mysql;

describe('Truncate and Rename Statements', () => {
  test('TRUNCATE TABLE statement', () => {
    const result = parse("TRUNCATE TABLE users");
    const ast = result.ast;
    
    assert.ok(isTruncate(ast), 'Should be Truncate type');
    assert.strictEqual(ast.type, 'truncate');
    assert.strictEqual(ast.keyword, 'table');
    assert.ok(Array.isArray(ast.name), 'name should be array');
    assert.strictEqual(ast.name[0].table, 'users');
  });

  test('TRUNCATE with database prefix', () => {
    const result = parse("TRUNCATE TABLE mydb.users");
    const ast = result.ast;
    
    assert.ok(isTruncate(ast), 'Should be Truncate type');
    assert.strictEqual(ast.name[0].db, 'mydb');
    assert.strictEqual(ast.name[0].table, 'users');
  });

  test('RENAME TABLE statement', () => {
    const result = parse("RENAME TABLE old_name TO new_name");
    const ast = result.ast;
    
    assert.ok(isRename(ast), 'Should be Rename type');
    assert.strictEqual(ast.type, 'rename');
    assert.ok(Array.isArray(ast.table), 'table should be array');
    assert.strictEqual(ast.table[0][0].table, 'old_name');
    assert.strictEqual(ast.table[0][1].table, 'new_name');
  });

  test('RENAME multiple tables', () => {
    const result = parse("RENAME TABLE t1 TO t2, t3 TO t4");
    const ast = result.ast;
    
    assert.ok(isRename(ast), 'Should be Rename type');
    assert.strictEqual(ast.table.length, 2);
    assert.strictEqual(ast.table[0][0].table, 't1');
    assert.strictEqual(ast.table[0][1].table, 't2');
    assert.strictEqual(ast.table[1][0].table, 't3');
    assert.strictEqual(ast.table[1][1].table, 't4');
  });
});
