import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Update, Insert_Replace, Column, SetList, InsertReplaceValue, Star } from '../../types.d.ts';

const parser = new Parser();

test('Column - simple', () => {
  const sql = 'SELECT id FROM users';
  const ast = parser.astify(sql) as Select;
  const col = (ast.columns as Column[])[0];
  
  console.log('Column simple:', JSON.stringify(col, null, 2));
  assert.strictEqual('expr' in col, true, 'expr should be present');
  assert.strictEqual('as' in col, true, 'as should be present');
  // type and loc are optional
});

test('Column - with alias', () => {
  const sql = 'SELECT id AS user_id FROM users';
  const ast = parser.astify(sql) as Select;
  const col = (ast.columns as Column[])[0];
  
  console.log('Column with alias:', JSON.stringify(col, null, 2));
  assert.strictEqual(col.as, 'user_id');
});

test('SetList - UPDATE', () => {
  const sql = 'UPDATE users SET name = "John" WHERE id = 1';
  const ast = parser.astify(sql) as Update;
  const setItem = ast.set[0] as SetList;
  
  console.log('SetList:', JSON.stringify(setItem, null, 2));
  assert.strictEqual('column' in setItem, true, 'column should be present');
  assert.strictEqual('value' in setItem, true, 'value should be present');
  assert.strictEqual('table' in setItem, true, 'table should be present');
  // loc is optional
});

test('SetList - with table prefix', () => {
  const sql = 'UPDATE users SET users.name = "John" WHERE id = 1';
  const ast = parser.astify(sql) as Update;
  const setItem = ast.set[0] as SetList;
  
  console.log('SetList with table:', JSON.stringify(setItem, null, 2));
  assert.ok(setItem.table);
});

test('InsertReplaceValue - INSERT VALUES', () => {
  const sql = 'INSERT INTO users VALUES (1, "John")';
  const ast = parser.astify(sql) as Insert_Replace;
  
  if (ast.values && typeof ast.values === 'object' && 'values' in ast.values) {
    const valuesArray = (ast.values as any).values as InsertReplaceValue[];
    const value = valuesArray[0];
    console.log('InsertReplaceValue:', JSON.stringify(value, null, 2));
    assert.strictEqual('type' in value, true, 'type should be present');
    assert.strictEqual('value' in value, true, 'value should be present');
    assert.strictEqual('prefix' in value, true, 'prefix should be present');
    // loc is optional
  }
});

test('Star - SELECT *', () => {
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql) as Select;
  
  console.log('Star:', JSON.stringify(ast.columns, null, 2));
  // Check if columns is Star type
  if (ast.columns === '*') {
    // It's just a string
  } else if (Array.isArray(ast.columns)) {
    // It's an array of columns
  } else if (typeof ast.columns === 'object' && ast.columns !== null) {
    const star = ast.columns as Star;
    if ('type' in star && star.type === 'star') {
      assert.strictEqual('value' in star, true, 'value should be present');
      // loc is optional
    }
  }
});
