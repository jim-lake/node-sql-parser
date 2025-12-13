import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Create, Function, OnUpdateCurrentTimestamp } from '../../types.d.ts';

const parser = new Parser();

test('Function suffix type is OnUpdateCurrentTimestamp or null', () => {
  const sql = 'SELECT CURRENT_TIMESTAMP() FROM dual';
  const ast = parser.astify(sql) as any;
  
  const func = ast.columns[0].expr as Function;
  assert.strictEqual(func.type, 'function');
  // suffix can be OnUpdateCurrentTimestamp | null | undefined
  assert.ok(func.suffix === null || func.suffix === undefined || typeof func.suffix === 'object');
});
