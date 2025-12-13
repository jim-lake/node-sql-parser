import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Create, TableOption } from '../../types.d.ts';

const parser = new Parser();

test('CREATE TABLE with table options', () => {
  const sql = 'CREATE TABLE users (id INT) ENGINE=InnoDB DEFAULT CHARSET=utf8';
  const ast = parser.astify(sql) as Create;
  
  assert.strictEqual(ast.type, 'create');
  assert.ok(Array.isArray(ast.table_options));
  const option = ast.table_options![0] as TableOption;
  assert.ok(option.keyword);
  assert.ok(option.value);
});
