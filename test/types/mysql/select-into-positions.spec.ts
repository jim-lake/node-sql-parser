import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select } from '../../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('Select.into - position null (no INTO clause)', () => {
  const sql = 'SELECT id FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.strictEqual(select.into.position, null);
});

test('Select.into - position "column" (INTO after SELECT)', () => {
  const sql = 'SELECT id INTO @var FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.strictEqual(select.into.position, 'column');
  assert.ok(select.into.expr);
});

test('Select.into - position "from" (INTO after FROM)', () => {
  const sql = 'SELECT id FROM users INTO OUTFILE "/tmp/data.txt"';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.strictEqual(select.into.position, 'from');
  assert.ok(select.into.expr);
});

test('Select.into - position "end" (INTO at end)', () => {
  const sql = 'SELECT id FROM users WHERE active = 1 INTO @var';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.strictEqual(select.into.position, 'end');
  assert.ok(select.into.expr);
});
