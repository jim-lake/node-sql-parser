import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, With, ColumnRef } from '../../types.d.ts';

const parser = new Parser();

test('WITH clause columns type', () => {
  const sql = 'WITH cte (id, name) AS (SELECT id, name FROM users) SELECT * FROM cte';
  const ast = parser.astify(sql) as Select;
  
  assert.strictEqual(ast.type, 'select');
  assert.ok(Array.isArray(ast.with));
  const withClause = ast.with![0] as With;
  assert.ok(Array.isArray(withClause.columns));
  const col = withClause.columns![0] as ColumnRef;
  assert.ok(col);
});
