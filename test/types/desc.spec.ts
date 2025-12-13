import { describe, test } from 'node:test';
import assert from 'node:assert';
import mysql from '../../build/mysql.js';
import { isDesc } from './types.guard.js';

const { parse } = mysql;

describe('Desc Statement', () => {
  test('DESCRIBE statement', () => {
    const result = parse("DESCRIBE users");
    const ast = result.ast;
    
    assert.ok(isDesc(ast), 'Should be Desc type');
    assert.strictEqual(ast.type, 'desc');
    assert.strictEqual(ast.table, 'users');
  });

  test('DESC statement (short form)', () => {
    const result = parse("DESC users");
    const ast = result.ast;
    
    assert.ok(isDesc(ast), 'Should be Desc type');
    assert.strictEqual(ast.type, 'desc');
    assert.strictEqual(ast.table, 'users');
  });
});
