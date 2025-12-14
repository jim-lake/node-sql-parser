import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Dual } from '../../../types.d.ts';
import { isSelect, isDual } from './types.guard.ts';

const parser = new Parser();

test('FROM DUAL - basic usage', () => {
  const sql = 'SELECT 1 FROM DUAL';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.from);
  assert.ok(Array.isArray(select.from));
  const from = select.from[0];
  assert.ok(isDual(from));
  const dual = from as Dual;
  assert.strictEqual(dual.type, 'dual');
});

test('FROM DUAL - with expression', () => {
  const sql = 'SELECT NOW() FROM DUAL';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.from);
  assert.ok(Array.isArray(select.from));
  const from = select.from[0];
  assert.ok(isDual(from));
});

test('UPDATE with DUAL', () => {
  const sql = 'UPDATE t1, DUAL SET t1.col = 1';
  const ast = parser.astify(sql);
  // This tests if Dual can appear in UPDATE table list
  assert.ok(ast);
});

test('DELETE with DUAL', () => {
  const sql = 'DELETE t1 FROM t1, DUAL WHERE t1.id = 1';
  const ast = parser.astify(sql);
  // This tests if Dual can appear in DELETE from list
  assert.ok(ast);
});
