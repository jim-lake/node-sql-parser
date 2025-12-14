import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Delete } from '../../../types.d.ts';
import { isDelete } from './types.guard.ts';

const parser = new Parser();

test('Delete.table.addition property', async (t) => {
  await t.test('should set addition: true for single-table DELETE without explicit table list', () => {
    const sql = 'DELETE FROM users WHERE id = 1';
    const ast = parser.astify(sql);
    
    assert.ok(isDelete(ast), 'Expected Delete AST');
    assert.ok(ast.table && ast.table.length > 0, 'Expected table array');
    assert.strictEqual(ast.table[0].addition, true, 'Expected addition: true');
  });

  await t.test('should not set addition for multi-table DELETE', () => {
    const sql = 'DELETE t1, t2 FROM users t1 JOIN orders t2 ON t1.id = t2.user_id WHERE t1.id = 1';
    const ast = parser.astify(sql);
    
    assert.ok(isDelete(ast), 'Expected Delete AST');
    assert.ok(ast.table && ast.table.length > 0, 'Expected table array');
    
    // Check that addition is not set (undefined or false)
    const hasAddition = ast.table.some(t => t.addition === true);
    assert.strictEqual(hasAddition, false, 'Expected no addition property for multi-table DELETE');
  });

  await t.test('should handle DELETE with table alias', () => {
    const sql = 'DELETE FROM users AS u WHERE u.id = 1';
    const ast = parser.astify(sql);
    
    assert.ok(isDelete(ast), 'Expected Delete AST');
    assert.ok(ast.table && ast.table.length > 0, 'Expected table array');
    assert.strictEqual(ast.table[0].addition, true, 'Expected addition: true for single-table DELETE with alias');
  });
});
