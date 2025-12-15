import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import { isTableColumnAst, isSelect } from './types.guard.ts';

const parser = new Parser();

describe('Subquery in SELECT Column', () => {
  test('Subquery in column returns TableColumnAst', () => {
    const ast = parser.astify("SELECT id, (SELECT name FROM users WHERE users.id = t.user_id) as user_name FROM t");
    assert.ok(isSelect(ast), 'Should be Select');
    const subqueryCol = ast.columns[1];
    
    assert.ok(isTableColumnAst(subqueryCol.expr), 'Subquery should be TableColumnAst');
  });

  test('Subquery ast is Select type', () => {
    const ast = parser.astify("SELECT id, (SELECT name FROM users) as user_name FROM t");
    assert.ok(isSelect(ast), 'Should be Select');
    const subqueryCol = ast.columns[1];
    
    assert.ok(isTableColumnAst(subqueryCol.expr), 'Subquery should be TableColumnAst');
    assert.ok(isSelect(subqueryCol.expr.ast), 'ast should be Select');
  });

  test('Multiple subqueries in SELECT', () => {
    const ast = parser.astify("SELECT (SELECT COUNT(*) FROM orders WHERE orders.user_id = u.id) as order_count, (SELECT MAX(created_at) FROM orders WHERE orders.user_id = u.id) as last_order FROM users u");
    
    assert.ok(isSelect(ast), 'Should be Select');
    assert.ok(isTableColumnAst(ast.columns[0].expr), 'First subquery should be TableColumnAst');
    assert.ok(isTableColumnAst(ast.columns[1].expr), 'Second subquery should be TableColumnAst');
  });
});
