import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateTrigger } from '../../../types.d.ts';
import { isCreate, isCreateTrigger } from './types.guard.ts';

const parser = new Parser();

test('CreateTrigger.table - single object form', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
  assert.ok(ast.table, 'Should have table property');
  
  // Check if it's a single object (not array)
  if (!Array.isArray(ast.table)) {
    assert.strictEqual(ast.table.db, null);
    assert.strictEqual(ast.table.table, 'users');
  } else {
    assert.fail('table should be a single object, not an array');
  }
});

test('CreateTrigger.table - with database name', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON mydb.users FOR EACH ROW SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
  assert.ok(ast.table, 'Should have table property');
  
  // Check if it's a single object (not array)
  if (!Array.isArray(ast.table)) {
    assert.strictEqual(ast.table.db, 'mydb');
    assert.strictEqual(ast.table.table, 'users');
  } else {
    assert.fail('table should be a single object, not an array');
  }
});
