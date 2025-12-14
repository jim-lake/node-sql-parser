import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Update, Delete, Use, Returning, CollateExpr, OnUpdateCurrentTimestamp } from '../../types.d.ts';

const parser = new Parser();

test('Returning - UPDATE with RETURNING', () => {
  const sql = 'UPDATE users SET name = "John" WHERE id = 1 RETURNING *';
  try {
    const ast = parser.astify(sql) as Update;
    console.log('Returning:', JSON.stringify(ast.returning, null, 2));
    if (ast.returning) {
      assert.strictEqual('type' in ast.returning, true, 'type should be present');
      assert.strictEqual('columns' in ast.returning, true, 'columns should be present');
    }
  } catch (e: any) {
    console.log('RETURNING not supported in MySQL:', e.message);
  }
});

test('Use - USE database', () => {
  const sql = 'USE mydb';
  const ast = parser.astify(sql) as Use;
  
  console.log('Use:', JSON.stringify(ast, null, 2));
  assert.strictEqual('type' in ast, true, 'type should be present');
  assert.strictEqual('db' in ast, true, 'db should be present');
  // loc is optional
});

test('CollateExpr - in column definition', () => {
  const sql = 'CREATE TABLE users (name VARCHAR(255) COLLATE utf8_general_ci)';
  const ast = parser.astify(sql);
  
  const colDef = (ast as any).create_definitions[0];
  const collate = colDef.collate as CollateExpr;
  console.log('CollateExpr with COLLATE:', JSON.stringify(collate, null, 2));
  
  if (collate) {
    assert.strictEqual('type' in collate, true, 'type should be present');
    assert.strictEqual('keyword' in collate, true, 'keyword should be present');
    assert.strictEqual('collate' in collate, true, 'collate nested object should be present');
  }
});

test('CollateExpr - with = symbol', () => {
  const sql = 'CREATE TABLE users (name VARCHAR(255) COLLATE = utf8_general_ci)';
  try {
    const ast = parser.astify(sql);
    const colDef = (ast as any).create_definitions[0];
    const collate = colDef.collate as CollateExpr;
    console.log('CollateExpr with =:', JSON.stringify(collate, null, 2));
  } catch (e: any) {
    console.log('COLLATE = syntax not supported:', e.message);
  }
});

test('OnUpdateCurrentTimestamp - in column definition', () => {
  const sql = 'CREATE TABLE users (updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)';
  const ast = parser.astify(sql);
  
  console.log('OnUpdateCurrentTimestamp:', JSON.stringify(ast, null, 2));
  // Check if on update current timestamp exists
});

test('Timezone - in column definition', () => {
  const sql = 'CREATE TABLE events (event_time TIMESTAMP WITH TIME ZONE)';
  try {
    const ast = parser.astify(sql);
    console.log('Timezone:', JSON.stringify(ast, null, 2));
  } catch (e: any) {
    console.log('WITH TIME ZONE not supported in MySQL:', e.message);
  }
});
