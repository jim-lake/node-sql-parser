import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, TableColumnAst } from '../../../types.d.ts';
import { isSelect, isTableColumnAst } from './types.guard.ts';

const parser = new Parser();

test('TableColumnAst.tableList - verify string[]', () => {
  const sql = 'SELECT (SELECT id FROM users) AS user_id';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  const subquery = ast.columns[0].expr as TableColumnAst;
  
  assert.ok(isTableColumnAst(subquery));
  assert.ok('tableList' in subquery);
  assert.ok(Array.isArray(subquery.tableList));
  assert.strictEqual(subquery.tableList.length, 1);
  assert.strictEqual(typeof subquery.tableList[0], 'string');
  assert.strictEqual(subquery.tableList[0], 'select::null::users');
});

test('TableColumnAst.columnList - verify string[]', () => {
  // Use a subquery in WHERE clause with IN to get multiple columns tracked
  const sql = 'SELECT * FROM users WHERE (id, name) IN (SELECT user_id, user_name FROM orders)';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  assert.ok(ast.where);
  
  // Find the subquery in the WHERE clause
  if (ast.where.type === 'binary_expr' && ast.where.operator === 'IN') {
    const right = ast.where.right;
    if (right.type === 'expr_list' && right.value && right.value.length > 0) {
      const subquery = right.value[0];
      if (isTableColumnAst(subquery)) {
        assert.ok('columnList' in subquery);
        assert.ok(Array.isArray(subquery.columnList));
        assert.ok(subquery.columnList.length >= 2);
        assert.strictEqual(typeof subquery.columnList[0], 'string');
        assert.strictEqual(typeof subquery.columnList[1], 'string');
      }
    }
  }
});

test('TableColumnAst.ast - verify AST[] | AST', () => {
  const sql = 'SELECT (SELECT id FROM users) AS user_id';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  const subquery = ast.columns[0].expr as TableColumnAst;
  
  assert.ok(isTableColumnAst(subquery));
  assert.ok('ast' in subquery);
  // For a single SELECT, ast should be a Select object
  assert.ok(isSelect(subquery.ast));
  assert.strictEqual(subquery.ast.type, 'select');
});

test('TableColumnAst.parentheses - verify boolean | undefined', () => {
  const sql = 'SELECT (SELECT id FROM users) AS user_id';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  const subquery = ast.columns[0].expr as TableColumnAst;
  
  assert.ok(isTableColumnAst(subquery));
  // parentheses property should exist and be boolean
  if ('parentheses' in subquery) {
    assert.strictEqual(typeof subquery.parentheses, 'boolean');
    assert.strictEqual(subquery.parentheses, true);
  }
});

test('TableColumnAst.loc - verify LocationRange | undefined', () => {
  const sql = 'SELECT (SELECT id FROM users) AS user_id';
  const ast = parser.astify(sql, { parseOptions: { includeLocations: true } }) as Select;
  
  assert.ok(isSelect(ast));
  const subquery = ast.columns[0].expr as TableColumnAst;
  
  assert.ok(isTableColumnAst(subquery));
  // loc should be present when includeLocations is true
  if ('loc' in subquery) {
    assert.ok(subquery.loc);
    assert.ok('start' in subquery.loc);
    assert.ok('end' in subquery.loc);
  }
});

test('TableColumnAst - complex subquery with joins', () => {
  const sql = 'SELECT (SELECT u.id FROM users u JOIN orders o ON u.id = o.user_id) AS data';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  const subquery = ast.columns[0].expr as TableColumnAst;
  
  assert.ok(isTableColumnAst(subquery));
  assert.ok(Array.isArray(subquery.tableList));
  assert.ok(subquery.tableList.length >= 2); // Should have both users and orders
  assert.ok(Array.isArray(subquery.columnList));
  assert.ok(isSelect(subquery.ast));
});

test('TableColumnAst - in WHERE clause with IN', () => {
  const sql = 'SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  assert.ok(ast.where);
  
  if (ast.where.type === 'binary_expr' && ast.where.operator === 'IN') {
    const right = ast.where.right;
    if (right.type === 'expr_list' && right.value && right.value.length > 0) {
      const subquery = right.value[0];
      // Check if it's a TableColumnAst
      assert.ok('tableList' in subquery && 'columnList' in subquery && 'ast' in subquery);
      if (isTableColumnAst(subquery)) {
        assert.ok(Array.isArray(subquery.tableList));
        assert.ok(Array.isArray(subquery.columnList));
        assert.ok(isSelect(subquery.ast));
        // parentheses may be undefined or boolean
        if ('parentheses' in subquery) {
          assert.strictEqual(typeof subquery.parentheses, 'boolean');
        }
      }
    }
  }
});
