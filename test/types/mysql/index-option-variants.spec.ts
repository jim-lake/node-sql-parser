import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import { isCreateIndex, isIndexOption } from './types.guard';

const parser = new Parser();

test('IndexOption - KEY_BLOCK_SIZE variant', () => {
  const sql = 'CREATE INDEX idx1 ON users (name) KEY_BLOCK_SIZE = 8';
  const ast = parser.astify(sql);

  assert.ok(isCreateIndex(ast));

  const option = ast.index_options[0];
  assert.ok(isIndexOption(option));
});

test('IndexOption - USING BTREE variant', () => {
  const sql = 'CREATE INDEX idx1 ON users (name) USING BTREE';
  const ast = parser.astify(sql);

  assert.ok(isCreateIndex(ast));

  const option = ast.index_options[0];
  assert.ok(isIndexOption(option));
});

test('IndexOption - USING HASH variant', () => {
  const sql = 'CREATE INDEX idx1 ON users (name) USING HASH';
  const ast = parser.astify(sql);

  assert.ok(isCreateIndex(ast));

  const option = ast.index_options[0];
  assert.ok(isIndexOption(option));
});

test('IndexOption - WITH PARSER variant (FULLTEXT only)', () => {
  const sql = 'CREATE FULLTEXT INDEX idx1 ON articles (content) WITH PARSER ngram';
  const ast = parser.astify(sql);

  assert.ok(isCreateIndex(ast));

  const option = ast.index_options[0];
  assert.ok(isIndexOption(option));
});

test('IndexOption - VISIBLE variant', () => {
  const sql = 'CREATE INDEX idx1 ON users (name) VISIBLE';
  const ast = parser.astify(sql);

  assert.ok(isCreateIndex(ast));

  const option = ast.index_options[0];
  assert.ok(isIndexOption(option));
});

test('IndexOption - INVISIBLE variant', () => {
  const sql = 'CREATE INDEX idx1 ON users (name) INVISIBLE';
  const ast = parser.astify(sql);

  assert.ok(isCreateIndex(ast));

  const option = ast.index_options[0];
  assert.ok(isIndexOption(option));
});

test('IndexOption - COMMENT variant', () => {
  const sql = "CREATE INDEX idx1 ON users (name) COMMENT 'my index'";
  const ast = parser.astify(sql);

  assert.ok(isCreateIndex(ast));

  const option = ast.index_options[0];
  assert.ok(isIndexOption(option));
});

test('IndexOption - multiple options', () => {
  const sql = 'CREATE INDEX idx1 ON users (name) USING BTREE KEY_BLOCK_SIZE = 8';
  const ast = parser.astify(sql);

  assert.ok(isCreateIndex(ast));

  // Verify both options are present and valid
  const usingOption = ast.index_options.find((opt: any) => opt.keyword === 'using');
  const keyBlockOption = ast.index_options.find((opt: any) => opt.type === 'key_block_size');

  assert.ok(isIndexOption(usingOption));

  assert.ok(isIndexOption(keyBlockOption));
});
