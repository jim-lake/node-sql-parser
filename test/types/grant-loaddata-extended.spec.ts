import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Grant, LoadData } from '../../types.d.ts';
import { isGrant, isLoadData } from './types.guard.ts';

const parser = new Parser();

test('GRANT statement', () => {
  const sql = 'GRANT SELECT ON mydb.* TO user1';
  const ast = parser.astify(sql);
  
  assert.ok(isGrant(ast), 'AST should be a Grant type');
  const grantAst = ast as Grant;
  assert.strictEqual(grantAst.type, 'grant');
});

test('LOAD DATA statement', () => {
  const sql = "LOAD DATA INFILE '/tmp/data.csv' INTO TABLE users";
  const ast = parser.astify(sql);
  
  assert.ok(isLoadData(ast), 'AST should be a LoadData type');
  const loadAst = ast as LoadData;
  assert.strictEqual(loadAst.type, 'load_data');
});
