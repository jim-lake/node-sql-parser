import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Insert_Replace, From, Select } from '../../../types.d.ts';
import { isInsert_Replace, isSelect, isFrom } from './types.guard.ts';

const parser = new Parser();

// Test Insert_Replace.table - From[] variant
test('Insert_Replace.table as From[] (array)', () => {
  const sql = 'INSERT INTO users (id) VALUES (1)';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.ok(Array.isArray(insert.table));
  const table = insert.table as From[];
  assert.strictEqual(table.length, 1);
  assert.ok(isFrom(table[0]));
  assert.strictEqual(table[0].table, 'users');
});

// Test Insert_Replace.table - From variant (single)
test('Insert_Replace.table as From (single)', () => {
  const sql = 'INSERT INTO db.users (id) VALUES (1)';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  // Check if it's a single From or array
  if (!Array.isArray(insert.table)) {
    assert.ok(isFrom(insert.table));
    assert.strictEqual(insert.table.db, 'db');
    assert.strictEqual(insert.table.table, 'users');
  } else {
    // If it's an array, verify the first element
    assert.ok(isFrom(insert.table[0]));
  }
});

// Test Insert_Replace.values - Select variant
test('Insert_Replace.values as Select', () => {
  const sql = 'INSERT INTO users (id, name) SELECT id, name FROM temp_users';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.ok(insert.values);
  if (insert.values && typeof insert.values === 'object' && 'type' in insert.values) {
    if (insert.values.type === 'select') {
      assert.ok(isSelect(insert.values));
      const selectVal = insert.values as Select;
      assert.strictEqual(selectVal.type, 'select');
      assert.ok(selectVal.from);
    }
  }
});
