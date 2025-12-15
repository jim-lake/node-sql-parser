import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateUser, UserAuthOption } from '../../../types.d.ts';
import { isCreate, isCreateUser, isValueExpr } from './types.guard.ts';

const parser = new Parser();

test('CreateUser - basic user creation', () => {
  const sql = "CREATE USER 'testuser'@'localhost'";
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateUser(ast), 'Should be CreateUser');
});

test('CreateUser - with password', () => {
  const sql = "CREATE USER 'testuser'@'localhost' IDENTIFIED BY 'password'";
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateUser(ast), 'Should be CreateUser');
  const user = ast.user![0] as UserAuthOption;
});

test('CreateUser - with IF NOT EXISTS', () => {
  const sql = "CREATE USER IF NOT EXISTS 'testuser'@'localhost'";
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateUser(ast), 'Should be CreateUser');
});

test('CreateUser - UserAuthOption user property', () => {
  const sql = "CREATE USER 'testuser'@'localhost'";
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateUser(ast), 'Should be CreateUser');
  const user = ast.user![0] as UserAuthOption;
});

test('CreateUser - multiple users', () => {
  const sql = "CREATE USER 'user1'@'localhost', 'user2'@'%'";
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateUser(ast), 'Should be CreateUser');
});
