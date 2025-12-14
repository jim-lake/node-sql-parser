import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateIndex } from '../../../types.d.ts';
import { isCreate } from './types.guard.ts';

const parser = new Parser();

test('CreateIndex.index_using - verify structure with BTREE', () => {
  const sql = 'CREATE INDEX idx USING BTREE ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.ok(create.index_using);
  assert.strictEqual(create.index_using.keyword, 'using');
  assert.strictEqual(create.index_using.type, 'btree');
});

test('CreateIndex.index_using - verify structure with HASH', () => {
  const sql = 'CREATE INDEX idx USING HASH ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.ok(create.index_using);
  assert.strictEqual(create.index_using.type, 'hash');
});

test('CreateIndex.index_using - verify null when not present', () => {
  const sql = 'CREATE INDEX idx ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.strictEqual(create.index_using, null);
});

test('CreateIndex.index - verify string value', () => {
  const sql = 'CREATE INDEX idx ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.strictEqual(create.index, 'idx');
});

test('CreateIndex.on_kw - verify "on" literal', () => {
  const sql = 'CREATE INDEX idx ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.strictEqual(create.on_kw, 'on');
});

test('CreateIndex.table - verify single object structure', () => {
  const sql = 'CREATE INDEX idx ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.ok(create.table);
  assert.ok(!Array.isArray(create.table));
  assert.strictEqual(create.table.table, 't');
  assert.strictEqual(create.table.db, null);
});

test('CreateIndex.table - verify with database prefix', () => {
  const sql = 'CREATE INDEX idx ON mydb.t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.ok(create.table);
  assert.strictEqual(create.table.table, 't');
  assert.strictEqual(create.table.db, 'mydb');
});

test('CreateIndex.index_columns - verify ColumnRefItem array', () => {
  const sql = 'CREATE INDEX idx ON t (col1, col2)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.ok(create.index_columns);
  assert.ok(Array.isArray(create.index_columns));
  assert.strictEqual(create.index_columns.length, 2);
});

test('CreateIndex.index_type - verify "unique" value', () => {
  const sql = 'CREATE UNIQUE INDEX idx ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.strictEqual(create.index_type, 'unique');
});

test('CreateIndex.index_type - verify "fulltext" value', () => {
  const sql = 'CREATE FULLTEXT INDEX idx ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.strictEqual(create.index_type, 'fulltext');
});

test('CreateIndex.index_type - verify "spatial" value', () => {
  const sql = 'CREATE SPATIAL INDEX idx ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.strictEqual(create.index_type, 'spatial');
});

test('CreateIndex.index_type - verify null when not present', () => {
  const sql = 'CREATE INDEX idx ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.strictEqual(create.index_type, null);
});

test('CreateIndex.index_options - verify IndexOption array', () => {
  const sql = 'CREATE INDEX idx ON t (col) COMMENT "test"';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.ok(create.index_options);
  assert.ok(Array.isArray(create.index_options));
  assert.ok(create.index_options.length > 0);
});

test('CreateIndex.index_options - verify null when not present', () => {
  const sql = 'CREATE INDEX idx ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.ok(create.index_options === null || create.index_options === undefined);
});

test('CreateIndex.algorithm_option - verify structure', () => {
  const sql = 'CREATE INDEX idx ON t (col) ALGORITHM = DEFAULT';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.ok(create.algorithm_option);
  assert.strictEqual(create.algorithm_option.type, 'alter');
  assert.strictEqual(create.algorithm_option.keyword, 'algorithm');
  assert.strictEqual(create.algorithm_option.resource, 'algorithm');
  assert.strictEqual(create.algorithm_option.algorithm, 'DEFAULT');
});

test('CreateIndex.algorithm_option - verify null when not present', () => {
  const sql = 'CREATE INDEX idx ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.strictEqual(create.algorithm_option, null);
});

test('CreateIndex.lock_option - verify structure', () => {
  const sql = 'CREATE INDEX idx ON t (col) LOCK = DEFAULT';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.ok(create.lock_option);
  assert.strictEqual(create.lock_option.type, 'alter');
  assert.strictEqual(create.lock_option.keyword, 'lock');
  assert.strictEqual(create.lock_option.resource, 'lock');
  assert.strictEqual(create.lock_option.lock, 'DEFAULT');
});

test('CreateIndex.lock_option - verify null when not present', () => {
  const sql = 'CREATE INDEX idx ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.strictEqual(create.lock_option, null);
});
