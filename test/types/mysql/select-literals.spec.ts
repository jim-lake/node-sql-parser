import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, ValueExpr, ColumnRef } from '../../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('SELECT with various literal types', () => {
  const sql = 'SELECT 1, 1e1, TRUE, FALSE, 1.1, NULL, "foo", \'bar\', `baz`';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast));
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.columns.length, 9);
  
  // 1 - integer
  const col0 = selectAst.columns[0].expr as ValueExpr;
  assert.strictEqual(col0.type, 'number');
  assert.strictEqual(col0.value, 1);
  
  // 1e1 - scientific notation
  const col1 = selectAst.columns[1].expr as ValueExpr;
  assert.strictEqual(col1.type, 'number');
  assert.strictEqual(col1.value, '1e1');
  
  // TRUE
  const col2 = selectAst.columns[2].expr as ValueExpr;
  assert.strictEqual(col2.type, 'bool');
  assert.strictEqual(col2.value, true);
  
  // FALSE
  const col3 = selectAst.columns[3].expr as ValueExpr;
  assert.strictEqual(col3.type, 'bool');
  assert.strictEqual(col3.value, false);
  
  // 1.1 - decimal
  const col4 = selectAst.columns[4].expr as ValueExpr;
  assert.strictEqual(col4.type, 'number');
  assert.strictEqual(col4.value, 1.1);
  
  // NULL
  const col5 = selectAst.columns[5].expr as ValueExpr;
  assert.strictEqual(col5.type, 'null');
  assert.strictEqual(col5.value, null);
  
  // "foo" - double quoted string
  const col6 = selectAst.columns[6].expr as ValueExpr;
  assert.strictEqual(col6.type, 'double_quote_string');
  assert.strictEqual(col6.value, 'foo');
  
  // 'bar' - single quoted string
  const col7 = selectAst.columns[7].expr as ValueExpr;
  assert.strictEqual(col7.type, 'single_quote_string');
  assert.strictEqual(col7.value, 'bar');
  
  // `baz` - backtick is a column reference, not a literal
  const col8 = selectAst.columns[8].expr as ColumnRef;
  assert.strictEqual(col8.type, 'column_ref');
  assert.strictEqual(col8.column, 'baz');
});
