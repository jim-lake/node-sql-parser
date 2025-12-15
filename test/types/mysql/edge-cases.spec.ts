import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Create } from '../../types.d.ts';
import { isSelect, isBinary, isCreate } from './types.guard.ts';

const parser = new Parser();

test('Select with HAVING is Binary not array', () => {
  const sql = 'SELECT COUNT(*) FROM t GROUP BY id HAVING COUNT(*) > 1';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.ok(isBinary(selectAst.having));
});

test('Create view with DEFINER is Binary', () => {
  const sql = "CREATE DEFINER = 'user'@'host' VIEW v AS SELECT 1";
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.ok(isBinary(createAst.definer));
});
