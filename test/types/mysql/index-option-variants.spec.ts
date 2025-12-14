import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import { isCreateIndex, isIndexOption } from './types.guard';

const parser = new Parser();

test('IndexOption Union Variants', async (t) => {
  await t.test('IndexOption - KEY_BLOCK_SIZE variant', () => {
    const sql = 'CREATE INDEX idx1 ON users (name) KEY_BLOCK_SIZE = 8';
    const ast = parser.astify(sql);
    
    assert.ok(isCreateIndex(ast));
    assert.ok(ast.index_options);
    assert.strictEqual(ast.index_options.length, 1);
    
    const option = ast.index_options[0];
    assert.ok(isIndexOption(option));
    assert.strictEqual(option.type, 'key_block_size');
    assert.strictEqual(option.symbol, '=');
    assert.ok(option.expr);
  });

  await t.test('IndexOption - USING BTREE variant', () => {
    const sql = 'CREATE INDEX idx1 ON users (name) USING BTREE';
    const ast = parser.astify(sql);
    
    assert.ok(isCreateIndex(ast));
    assert.ok(ast.index_options);
    assert.strictEqual(ast.index_options.length, 1);
    
    const option = ast.index_options[0];
    assert.ok(isIndexOption(option));
    assert.strictEqual(option.keyword, 'using');
    assert.strictEqual(option.type, 'btree');
  });

  await t.test('IndexOption - USING HASH variant', () => {
    const sql = 'CREATE INDEX idx1 ON users (name) USING HASH';
    const ast = parser.astify(sql);
    
    assert.ok(isCreateIndex(ast));
    assert.ok(ast.index_options);
    assert.strictEqual(ast.index_options.length, 1);
    
    const option = ast.index_options[0];
    assert.ok(isIndexOption(option));
    assert.strictEqual(option.keyword, 'using');
    assert.strictEqual(option.type, 'hash');
  });

  await t.test('IndexOption - WITH PARSER variant (FULLTEXT only)', () => {
    const sql = 'CREATE FULLTEXT INDEX idx1 ON articles (content) WITH PARSER ngram';
    const ast = parser.astify(sql);
    
    assert.ok(isCreateIndex(ast));
    assert.ok(ast.index_options);
    assert.strictEqual(ast.index_options.length, 1);
    
    const option = ast.index_options[0];
    assert.ok(isIndexOption(option));
    assert.strictEqual(option.type, 'with parser');
    assert.strictEqual(option.expr, 'ngram');
  });

  await t.test('IndexOption - VISIBLE variant', () => {
    const sql = 'CREATE INDEX idx1 ON users (name) VISIBLE';
    const ast = parser.astify(sql);
    
    assert.ok(isCreateIndex(ast));
    assert.ok(ast.index_options);
    assert.strictEqual(ast.index_options.length, 1);
    
    const option = ast.index_options[0];
    assert.ok(isIndexOption(option));
    assert.strictEqual(option.type, 'visible');
    assert.strictEqual(option.expr, 'visible');
  });

  await t.test('IndexOption - INVISIBLE variant', () => {
    const sql = 'CREATE INDEX idx1 ON users (name) INVISIBLE';
    const ast = parser.astify(sql);
    
    assert.ok(isCreateIndex(ast));
    assert.ok(ast.index_options);
    assert.strictEqual(ast.index_options.length, 1);
    
    const option = ast.index_options[0];
    assert.ok(isIndexOption(option));
    assert.strictEqual(option.type, 'invisible');
    assert.strictEqual(option.expr, 'invisible');
  });

  await t.test('IndexOption - COMMENT variant', () => {
    const sql = "CREATE INDEX idx1 ON users (name) COMMENT 'my index'";
    const ast = parser.astify(sql);
    
    assert.ok(isCreateIndex(ast));
    assert.ok(ast.index_options);
    assert.strictEqual(ast.index_options.length, 1);
    
    const option = ast.index_options[0];
    assert.ok(isIndexOption(option));
    assert.strictEqual(option.type, 'comment');
    assert.strictEqual(option.keyword, 'comment');
    assert.ok(option.value);
  });

  await t.test('IndexOption - multiple options', () => {
    const sql = 'CREATE INDEX idx1 ON users (name) USING BTREE KEY_BLOCK_SIZE = 8';
    const ast = parser.astify(sql);
    
    assert.ok(isCreateIndex(ast));
    assert.ok(ast.index_options);
    assert.strictEqual(ast.index_options.length, 2);
    
    // Verify both options are present and valid
    const usingOption = ast.index_options.find((opt: any) => opt.keyword === 'using');
    const keyBlockOption = ast.index_options.find((opt: any) => opt.type === 'key_block_size');
    
    assert.ok(usingOption, 'Should have USING option');
    assert.ok(isIndexOption(usingOption));
    assert.strictEqual(usingOption.type, 'btree');
    
    assert.ok(keyBlockOption, 'Should have KEY_BLOCK_SIZE option');
    assert.ok(isIndexOption(keyBlockOption));
    assert.strictEqual(keyBlockOption.symbol, '=');
  });
});
