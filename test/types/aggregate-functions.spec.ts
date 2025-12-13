import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Column, AggrFunc } from '../../types.d.ts';

const parser = new Parser();

test('GROUP_CONCAT with separator', () => {
  const sql = "SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM users";
  const ast = parser.astify(sql) as Select;
  
  const col = (ast.columns as Column[])[0];
  const aggrFunc = col.expr as AggrFunc;
  assert.strictEqual(aggrFunc.type, 'aggr_func');
  assert.ok(aggrFunc.args.separator);
  assert.strictEqual(typeof aggrFunc.args.separator, 'object');
});
