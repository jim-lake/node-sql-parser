import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import { isSelect, isBinary, isExprList } from './types.guard.ts';

const parser = new Parser();

describe('Binary, Unary, and ExprList Types', () => {
  test('Binary expression with AND operator', () => {
    const ast = parser.astify("SELECT * FROM t WHERE a AND b");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
  });

  test('Binary expression with OR operator', () => {
    const ast = parser.astify("SELECT * FROM t WHERE a OR b");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
  });

  test('Binary expression with comparison operators', () => {
    const ast = parser.astify("SELECT * FROM t WHERE age > 18");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
  });

  test('Binary expression with BETWEEN', () => {
    const ast = parser.astify("SELECT * FROM t WHERE age BETWEEN 18 AND 65");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
  });

  test('Binary expression with IS NULL', () => {
    const ast = parser.astify("SELECT * FROM t WHERE name IS NULL");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
  });

  test('Binary expression with IS NOT NULL', () => {
    const ast = parser.astify("SELECT * FROM t WHERE name IS NOT NULL");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
  });

  test('Unary expression with NOT', () => {
    const ast = parser.astify("SELECT * FROM t WHERE NOT active");
    assert.ok(isSelect(ast), 'Should be Select');
  });

  test('ExprList in IN clause', () => {
    const ast = parser.astify("SELECT * FROM t WHERE id IN (1, 2, 3)");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
    assert.ok(isExprList(where.right), 'Right side should be ExprList');
  });

  test('ExprList in function arguments', () => {
    const ast = parser.astify("SELECT CONCAT(first_name, ' ', last_name) FROM users");
    assert.ok(isSelect(ast), 'Should be Select');
    const column = ast.columns[0];
    const args = column.expr.args;
    assert.ok(isExprList(args), 'Function args should be ExprList');
  });

  test('Binary expression with nested structure', () => {
    const ast = parser.astify("SELECT * FROM t WHERE (a AND b) OR c");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
    assert.ok(isBinary(where.left), 'Left side should be Binary');
  });

  test('EXISTS is a Function type', () => {
    const ast = parser.astify("SELECT * FROM t WHERE EXISTS (SELECT 1 FROM users)");
    assert.ok(isSelect(ast), 'Should be Select');
  });
});
