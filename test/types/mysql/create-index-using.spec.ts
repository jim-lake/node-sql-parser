import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateIndex } from '../../../types.d.ts';
import { isCreate } from './types.guard.ts';

const parser = new Parser();

test('CREATE INDEX with USING BTREE after index name', () => {
  const sql = 'CREATE INDEX idx USING BTREE ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.strictEqual(create.type, 'create');
  assert.strictEqual(create.keyword, 'index');
  assert.ok(create.index_using);
  assert.strictEqual(create.index_using.keyword, 'using');
  assert.strictEqual(create.index_using.type, 'btree');
});

test('CREATE INDEX with USING HASH after index name', () => {
  const sql = 'CREATE INDEX idx USING HASH ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.ok(create.index_using);
  assert.strictEqual(create.index_using.keyword, 'using');
  assert.strictEqual(create.index_using.type, 'hash');
});

test('CREATE INDEX without USING', () => {
  const sql = 'CREATE INDEX idx ON t (col)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateIndex;
  assert.strictEqual(create.index_using, null);
});
