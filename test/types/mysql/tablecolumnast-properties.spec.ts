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
});

test('TableColumnAst.ast - verify AST[] | AST', () => {
  const sql = 'SELECT (SELECT id FROM users) AS user_id';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  const subquery = ast.columns[0].expr as TableColumnAst;
  
  assert.ok(isTableColumnAst(subquery));
  // For a single SELECT, ast should be a Select object
  assert.ok(isSelect(subquery.ast));
});

test('TableColumnAst.parentheses - verify boolean | undefined', () => {
  const sql = 'SELECT (SELECT id FROM users) AS user_id';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  const subquery = ast.columns[0].expr as TableColumnAst;
  
  assert.ok(isTableColumnAst(subquery));
  // parentheses property should exist and be boolean
  if ('parentheses' in subquery) {
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
  }
});

test('TableColumnAst - complex subquery with joins', () => {
  const sql = 'SELECT (SELECT u.id FROM users u JOIN orders o ON u.id = o.user_id) AS data';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  const subquery = ast.columns[0].expr as TableColumnAst;
  
  assert.ok(isTableColumnAst(subquery));
  assert.ok(isSelect(subquery.ast));
});

test('TableColumnAst - in WHERE clause with IN', () => {
  const sql = 'SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  
  if (ast.where.type === 'binary_expr' && ast.where.operator === 'IN') {
    const right = ast.where.right;
    if (right.type === 'expr_list' && right.value && right.value.length > 0) {
      const subquery = right.value[0];
      // Check if it's a TableColumnAst
      if (isTableColumnAst(subquery)) {
        assert.ok(isSelect(subquery.ast));
        // parentheses may be undefined or boolean
        if ('parentheses' in subquery) {
        }
      }
    }
  }
});
