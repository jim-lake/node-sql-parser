import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateTable } from '../../../types.d.ts';
import { isCreate, isCreateTable } from './types.guard.ts';

const parser = new Parser();

test('CREATE TABLE LIKE - basic', () => {
  const sql = 'CREATE TABLE new_users LIKE users';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.strictEqual(create.type, 'create');
  assert.strictEqual(create.keyword, 'table');
  assert.ok(create.like);
  assert.strictEqual(create.like.type, 'like');
  assert.ok(create.like.table);
  assert.ok(Array.isArray(create.like.table));
});

test('CREATE TABLE LIKE - with database prefix', () => {
  const sql = 'CREATE TABLE new_db.new_users LIKE old_db.users';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.like);
  assert.strictEqual(create.like.type, 'like');
  assert.ok(create.like.table);
});

test('CREATE TABLE LIKE - with parentheses', () => {
  const sql = 'CREATE TABLE new_users (LIKE users)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.like);
  assert.strictEqual(create.like.type, 'like');
  if (create.like.parentheses !== undefined) {
    assert.strictEqual(create.like.parentheses, true);
  }
});

test('CREATE TABLE without LIKE', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);

  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTable(ast));
  const create = ast as CreateTable;
  assert.ok(create.like === null || create.like === undefined);
});
