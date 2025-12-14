import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, With } from '../../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('With.name - verify structure {value: string}', () => {
  const sql = 'WITH my_cte AS (SELECT 1) SELECT * FROM my_cte';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  assert.ok(ast.with);
  const withClause = ast.with[0] as With;
  
  // Verify name structure
  assert.ok(withClause.name);
  assert.strictEqual(typeof withClause.name, 'object');
  assert.ok('value' in withClause.name);
  assert.strictEqual(typeof withClause.name.value, 'string');
  assert.strictEqual(withClause.name.value, 'my_cte');
});

test('With.stmt - verify all properties', () => {
  const sql = 'WITH cte AS (SELECT id, name FROM users) SELECT * FROM cte';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  const withClause = ast.with![0] as With;
  
  // Verify stmt structure
  assert.ok(withClause.stmt);
  assert.strictEqual(typeof withClause.stmt, 'object');
  
  // Verify stmt.tableList
  assert.ok('tableList' in withClause.stmt);
  assert.ok(Array.isArray(withClause.stmt.tableList));
  assert.strictEqual(withClause.stmt.tableList.length, 1);
  assert.strictEqual(withClause.stmt.tableList[0], 'select::null::users');
  
  // Verify stmt.columnList
  assert.ok('columnList' in withClause.stmt);
  assert.ok(Array.isArray(withClause.stmt.columnList));
  assert.strictEqual(withClause.stmt.columnList.length, 2);
  // Note: In CTE context, columns are tracked without table qualifier
  assert.strictEqual(withClause.stmt.columnList[0], 'select::null::id');
  assert.strictEqual(withClause.stmt.columnList[1], 'select::null::name');
  
  // Verify stmt.ast
  assert.ok('ast' in withClause.stmt);
  assert.ok(isSelect(withClause.stmt.ast));
  assert.strictEqual(withClause.stmt.ast.type, 'select');
  
  // Verify stmt._parentheses (optional)
  if ('_parentheses' in withClause.stmt) {
    assert.strictEqual(typeof withClause.stmt._parentheses, 'boolean');
  }
});

test('With.columns - verify ColumnRef[] | null', () => {
  // Test with columns
  const sql1 = 'WITH cte (id, name) AS (SELECT 1, 2) SELECT * FROM cte';
  const ast1 = parser.astify(sql1) as Select;
  
  assert.ok(isSelect(ast1));
  const withClause1 = ast1.with![0] as With;
  
  assert.ok(withClause1.columns);
  assert.ok(Array.isArray(withClause1.columns));
  assert.strictEqual(withClause1.columns.length, 2);
  assert.strictEqual(withClause1.columns[0].type, 'column_ref');
  assert.strictEqual(withClause1.columns[0].column, 'id');
  assert.strictEqual(withClause1.columns[1].type, 'column_ref');
  assert.strictEqual(withClause1.columns[1].column, 'name');
  
  // Test without columns
  const sql2 = 'WITH cte AS (SELECT 1, 2) SELECT * FROM cte';
  const ast2 = parser.astify(sql2) as Select;
  
  assert.ok(isSelect(ast2));
  const withClause2 = ast2.with![0] as With;
  
  assert.strictEqual(withClause2.columns, null);
});

test('With - multiple CTEs', () => {
  const sql = 'WITH cte1 AS (SELECT 1), cte2 (x) AS (SELECT 2) SELECT * FROM cte1, cte2';
  const ast = parser.astify(sql) as Select;
  
  assert.ok(isSelect(ast));
  assert.ok(ast.with);
  assert.strictEqual(ast.with.length, 2);
  
  // First CTE
  const cte1 = ast.with[0] as With;
  assert.strictEqual(cte1.name.value, 'cte1');
  assert.strictEqual(cte1.columns, null);
  assert.ok(isSelect(cte1.stmt.ast));
  
  // Second CTE
  const cte2 = ast.with[1] as With;
  assert.strictEqual(cte2.name.value, 'cte2');
  assert.ok(cte2.columns);
  assert.strictEqual(cte2.columns.length, 1);
  assert.strictEqual(cte2.columns[0].column, 'x');
  assert.ok(isSelect(cte2.stmt.ast));
});
