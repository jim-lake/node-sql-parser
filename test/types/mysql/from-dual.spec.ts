import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Dual } from '../../../types.d.ts';
import { isSelect, isDual, isUpdate, isDelete } from './types.guard.ts';

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

