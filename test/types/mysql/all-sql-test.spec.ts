import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Parser } from './parser-loader.mjs';
import {
  isSelect,
  isInsert_Replace,
  isUpdate,
  isDelete,
  isCreate,
  isDrop,
  isAlter,
  isTruncate,
  isRename,
  isGrant,
  isDesc,
  isShow,
  isUse,
  isSet,
  isLock,
  isUnlock,
  isCall,
  isLoadData,
  isExplain
} from './types.guard';

const parser = new Parser();

function readSqlFile(filename: string): string[] {
  const content = readFileSync(join(__dirname, filename), 'utf8');
  return content.split(';\n').filter(s => s.trim().length > 0);
}

function getAst(sql: string) {
  const ast = parser.astify(sql);
  return Array.isArray(ast) ? ast[0] : ast;
}

test('alter.sql statements', () => {
  const statements = readSqlFile('alter.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isAlter(ast), `isAlter: ${sql}`);
  }
});

test('call.sql statements', () => {
  const statements = readSqlFile('call.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isCall(ast), `isCall: ${sql}`);
  }
});

test('create.sql statements', () => {
  const statements = readSqlFile('create.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    const checkAst = Array.isArray(ast) ? ast[0] : ast;
    assert.ok(isCreate(checkAst), `isCreate: ${sql}`);
  }
});

test('delete.sql statements', () => {
  const statements = readSqlFile('delete.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isDelete(ast), `isDelete: ${sql}`);
  }
});

test('desc.sql statements', () => {
  const statements = readSqlFile('desc.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isDesc(ast), `isDesc: ${sql}`);
  }
});

test('drop.sql statements', () => {
  const statements = readSqlFile('drop.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isDrop(ast), `isDrop: ${sql}`);
  }
});

test('explain.sql statements', () => {
  const statements = readSqlFile('explain.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isExplain(ast), `isExplain: ${sql}`);
  }
});

test('grant.sql statements', () => {
  const statements = readSqlFile('grant.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isGrant(ast), `isGrant: ${sql}`);
  }
});

test('insert.sql statements', () => {
  const statements = readSqlFile('insert.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isInsert_Replace(ast), `isInsert_Replace: ${sql}`);
  }
});

test('load.sql statements', () => {
  const statements = readSqlFile('load.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isLoadData(ast), `isLoadData: ${sql}`);
  }
});

test('lock.sql statements', () => {
  const statements = readSqlFile('lock.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isLock(ast), `isLock: ${sql}`);
  }
});

test('rename.sql statements', () => {
  const statements = readSqlFile('rename.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isRename(ast), `isRename: ${sql}`);
  }
});

test('replace.sql statements', () => {
  const statements = readSqlFile('replace.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isInsert_Replace(ast), `isInsert_Replace: ${sql}`);
  }
});

test('select.sql statements', () => {
  const statements = readSqlFile('select.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isSelect(ast), `isSelect: ${sql}`);
  }
});

test('set.sql statements', () => {
  const statements = readSqlFile('set.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isSet(ast), `isSet: ${sql}`);
  }
});

test('show.sql statements', () => {
  const statements = readSqlFile('show.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isShow(ast), `isShow: ${sql}`);
  }
});

test('truncate.sql statements', () => {
  const statements = readSqlFile('truncate.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isTruncate(ast), `isTruncate: ${sql}`);
  }
});

test('unlock.sql statements', () => {
  const statements = readSqlFile('unlock.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isUnlock(ast), `isUnlock: ${sql}`);
  }
});

test('update.sql statements', () => {
  const statements = readSqlFile('update.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isUpdate(ast), `isUpdate: ${sql}`);
  }
});

test('use.sql statements', () => {
  const statements = readSqlFile('use.sql');
  for (const sql of statements) {
    const ast = parser.astify(sql);
    assert.ok(isUse(ast), `isUse: ${sql}`);
  }
});
