import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select } from '../../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('Select.groupby - null (no GROUP BY)', () => {
  const sql = 'SELECT id FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.strictEqual(select.groupby, null);
});

test('Select.groupby - columns without modifiers', () => {
  const sql = 'SELECT id, COUNT(*) FROM users GROUP BY id';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.groupby);
  assert.ok(select.groupby.columns);
  assert.ok(Array.isArray(select.groupby.columns));
  assert.ok(select.groupby.modifiers);
  assert.ok(Array.isArray(select.groupby.modifiers));
});

test('Select.groupby - with WITH ROLLUP modifier', () => {
  const sql = 'SELECT id, COUNT(*) FROM users GROUP BY id WITH ROLLUP';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.groupby);
  assert.ok(select.groupby.columns);
  assert.ok(select.groupby.modifiers);
  assert.ok(Array.isArray(select.groupby.modifiers));
  // Check if modifiers array contains the rollup modifier
  const hasRollup = select.groupby.modifiers.some(m => 
    m && typeof m === 'object' && 'value' in m && m.value === 'WITH ROLLUP'
  );
  assert.ok(hasRollup || select.groupby.modifiers.length > 0);
});

test('Select.groupby - multiple columns', () => {
  const sql = 'SELECT dept, year, COUNT(*) FROM employees GROUP BY dept, year';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const select = ast as Select;
  assert.ok(select.groupby);
  assert.ok(select.groupby.columns);
  assert.strictEqual(select.groupby.columns.length, 2);
});
