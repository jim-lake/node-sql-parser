import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Insert_Replace, Select } from '../../../types.d.ts';
import { isInsert_Replace, isSelect } from './types.guard.ts';

const parser = new Parser();

test('INSERT with SET syntax', () => {
  const sql = 'INSERT INTO users SET name = "John", age = 30';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.strictEqual(insert.type, 'insert');
  assert.ok(insert.set);
  assert.ok(Array.isArray(insert.set));
  assert.strictEqual(insert.set.length, 2);
  assert.strictEqual(insert.set[0].column, 'name');
  assert.strictEqual(insert.set[1].column, 'age');
});

test('INSERT with VALUES (type: values variant)', () => {
  const sql = 'INSERT INTO users (name, age) VALUES ("John", 30)';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.strictEqual(insert.type, 'insert');
  assert.ok(insert.values);
  if (insert.values && typeof insert.values === 'object' && 'type' in insert.values) {
    assert.strictEqual(insert.values.type, 'values');
    assert.ok(insert.values.values);
    assert.ok(Array.isArray(insert.values.values));
  }
});

test('INSERT with SELECT (Select variant)', () => {
  const sql = 'INSERT INTO users (name, age) SELECT name, age FROM temp_users';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const insert = ast as Insert_Replace;
  assert.strictEqual(insert.type, 'insert');
  assert.ok(insert.values);
  // Check if values is a Select
  if (insert.values && typeof insert.values === 'object' && 'type' in insert.values) {
    if (insert.values.type === 'select') {
      assert.ok(isSelect(insert.values));
      const selectVal = insert.values as Select;
      assert.ok(selectVal.from);
    }
  }
});

test('REPLACE with SET syntax', () => {
  const sql = 'REPLACE INTO users SET name = "John", age = 30';
  const ast = parser.astify(sql);
  assert.ok(isInsert_Replace(ast));
  const replace = ast as Insert_Replace;
  assert.strictEqual(replace.type, 'replace');
  assert.ok(replace.set);
  assert.ok(Array.isArray(replace.set));
});
