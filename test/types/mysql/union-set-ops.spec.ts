import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select } from '../../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('UNION - basic', () => {
  const sql = 'SELECT id FROM users UNION SELECT id FROM customers';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select._next);
  assert.ok(isSelect(select._next));
  assert.strictEqual(select.set_op, 'union');
});

test('UNION ALL', () => {
  const sql = 'SELECT id FROM users UNION ALL SELECT id FROM customers';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select._next);
  assert.ok(isSelect(select._next));
  assert.strictEqual(select.set_op, 'union all');
});

test('UNION DISTINCT', () => {
  const sql = 'SELECT id FROM users UNION DISTINCT SELECT id FROM customers';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select._next);
  assert.ok(isSelect(select._next));
  assert.ok(select.set_op);
  assert.ok(select.set_op.includes('union'));
});

test('Multiple UNION operations', () => {
  const sql = 'SELECT id FROM users UNION SELECT id FROM customers UNION SELECT id FROM vendors';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select._next);
  assert.ok(isSelect(select._next));
  const next = select._next as Select;
  assert.ok(next._next);
  assert.ok(isSelect(next._next));
});
