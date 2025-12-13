import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, With, ColumnRef } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('WITH clause columns type', () => {
  const sql = 'WITH cte (id, name) AS (SELECT id, name FROM users) SELECT * FROM cte';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.type, 'select');
  assert.ok(Array.isArray(selectAst.with));
  const withClause = selectAst.with![0] as With;
  assert.ok(Array.isArray(withClause.columns));
  const col = withClause.columns![0] as ColumnRef;
  assert.ok(col);
});
