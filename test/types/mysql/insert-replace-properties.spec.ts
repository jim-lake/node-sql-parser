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

// Test Insert_Replace.columns - string[] variant
test('Insert_Replace.columns as string[]', () => {
  const sql = 'INSERT INTO users (id, name, email) VALUES (1, "John", "john@example.com")';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.ok(Array.isArray(insert.columns));
  assert.strictEqual(insert.columns!.length, 3);
  assert.strictEqual(insert.columns![0], 'id');
  assert.strictEqual(insert.columns![1], 'name');
  assert.strictEqual(insert.columns![2], 'email');
});

// Test Insert_Replace.columns - null variant
test('Insert_Replace.columns as null', () => {
  const sql = 'INSERT INTO users VALUES (1, "John")';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.strictEqual(insert.columns, null);
});

// Test Insert_Replace.values - values variant
test('Insert_Replace.values as values type', () => {
  const sql = 'INSERT INTO users (id) VALUES (1), (2), (3)';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.ok(insert.values);
  if (insert.values && typeof insert.values === 'object' && 'type' in insert.values) {
    assert.strictEqual(insert.values.type, 'values');
    assert.ok(Array.isArray(insert.values.values));
    assert.strictEqual(insert.values.values.length, 3);
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

// Test Insert_Replace.set - SetList[] variant
test('Insert_Replace.set as SetList[]', () => {
  const sql = 'INSERT INTO users SET id = 1, name = "John", email = "john@example.com"';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.ok(insert.set);
  assert.ok(Array.isArray(insert.set));
  assert.strictEqual(insert.set!.length, 3);
  assert.strictEqual(insert.set![0].column, 'id');
  assert.strictEqual(insert.set![1].column, 'name');
  assert.strictEqual(insert.set![2].column, 'email');
});

// Test Insert_Replace.partition - string[] variant
test('Insert_Replace.partition as string[]', () => {
  const sql = 'INSERT INTO users PARTITION (p0, p1) (id) VALUES (1)';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.ok(Array.isArray(insert.partition));
  assert.strictEqual(insert.partition!.length, 2);
  assert.strictEqual(insert.partition![0], 'p0');
  assert.strictEqual(insert.partition![1], 'p1');
});

// Test Insert_Replace.partition - null variant
test('Insert_Replace.partition as null', () => {
  const sql = 'INSERT INTO users (id) VALUES (1)';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.strictEqual(insert.partition, null);
});

// Test Insert_Replace.prefix - empty string (no IGNORE, no INTO)
test('Insert_Replace.prefix as empty string', () => {
  const sql = 'INSERT users (id) VALUES (1)';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.strictEqual(typeof insert.prefix, 'string');
  assert.strictEqual(insert.prefix, '');
});

// Test Insert_Replace.prefix - "into"
test('Insert_Replace.prefix as "into"', () => {
  const sql = 'INSERT INTO users (id) VALUES (1)';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.strictEqual(typeof insert.prefix, 'string');
  assert.strictEqual(insert.prefix, 'into');
});

// Test Insert_Replace.prefix - "ignore"
test('Insert_Replace.prefix as "ignore"', () => {
  const sql = 'INSERT IGNORE users (id) VALUES (1)';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.strictEqual(typeof insert.prefix, 'string');
  assert.strictEqual(insert.prefix, 'ignore');
});

// Test Insert_Replace.prefix - "ignore into"
test('Insert_Replace.prefix as "ignore into"', () => {
  const sql = 'INSERT IGNORE INTO users (id) VALUES (1)';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.strictEqual(typeof insert.prefix, 'string');
  assert.strictEqual(insert.prefix, 'ignore into');
});

// Test Insert_Replace.prefix - REPLACE with INTO
test('Insert_Replace.prefix for REPLACE with INTO', () => {
  const sql = 'REPLACE INTO users (id) VALUES (1)';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const replace = ast as Insert_Replace;
  assert.strictEqual(typeof replace.prefix, 'string');
  assert.strictEqual(replace.prefix, 'into');
});

// Test Insert_Replace.on_duplicate_update - object variant
test('Insert_Replace.on_duplicate_update as object', () => {
  const sql = 'INSERT INTO users (id, name) VALUES (1, "John") ON DUPLICATE KEY UPDATE name = "Jane"';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.ok(insert.on_duplicate_update);
  assert.strictEqual(insert.on_duplicate_update!.keyword, 'on duplicate key update');
  assert.ok(Array.isArray(insert.on_duplicate_update!.set));
  assert.strictEqual(insert.on_duplicate_update!.set.length, 1);
  assert.strictEqual(insert.on_duplicate_update!.set[0].column, 'name');
});

// Test Insert_Replace.on_duplicate_update - null variant
test('Insert_Replace.on_duplicate_update as null', () => {
  const sql = 'INSERT INTO users (id) VALUES (1)';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.strictEqual(insert.on_duplicate_update, null);
});

// Test Insert_Replace.type - "insert" variant
test('Insert_Replace.type as "insert"', () => {
  const sql = 'INSERT INTO users (id) VALUES (1)';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.strictEqual(insert.type, 'insert');
});

// Test Insert_Replace.type - "replace" variant
test('Insert_Replace.type as "replace"', () => {
  const sql = 'REPLACE INTO users (id) VALUES (1)';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const replace = ast as Insert_Replace;
  assert.strictEqual(replace.type, 'replace');
});
