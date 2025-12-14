import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, BaseFrom, Join, TableExpr, Dual, From } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('BaseFrom - simple table', () => {
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql) as Select;
  const from = (ast.from as From[])[0] as BaseFrom;
  
  console.log('BaseFrom simple:', JSON.stringify(from, null, 2));
  assert.strictEqual(from.table, 'users');
  assert.strictEqual('db' in from, true, 'db should be present');
  assert.strictEqual('as' in from, true, 'as should be present');
  // schema and addition are optional - not always present
});

test('BaseFrom - with alias', () => {
  const sql = 'SELECT * FROM users AS u';
  const ast = parser.astify(sql) as Select;
  const from = (ast.from as From[])[0] as BaseFrom;
  
  console.log('BaseFrom with alias:', JSON.stringify(from, null, 2));
  assert.strictEqual(from.as, 'u');
});

test('BaseFrom - with database', () => {
  const sql = 'SELECT * FROM mydb.users';
  const ast = parser.astify(sql) as Select;
  const from = (ast.from as From[])[0] as BaseFrom;
  
  console.log('BaseFrom with db:', JSON.stringify(from, null, 2));
  assert.strictEqual(from.db, 'mydb');
  assert.strictEqual(from.table, 'users');
});

test('Join - INNER JOIN with ON', () => {
  const sql = 'SELECT * FROM users INNER JOIN orders ON users.id = orders.user_id';
  const ast = parser.astify(sql) as Select;
  const join = (ast.from as From[])[1] as Join;
  
  console.log('Join with ON:', JSON.stringify(join, null, 2));
  assert.strictEqual(join.join, 'INNER JOIN');
  // using and on are mutually exclusive - both optional
  assert.ok(join.on);
  assert.strictEqual('using' in join, false, 'using should not be present when ON is used');
});

test('Join - with USING', () => {
  const sql = 'SELECT * FROM users INNER JOIN orders USING (user_id)';
  const ast = parser.astify(sql) as Select;
  const join = (ast.from as From[])[1] as Join;
  
  console.log('Join with USING:', JSON.stringify(join, null, 2));
  assert.ok(join.using);
  assert.ok(Array.isArray(join.using));
});

test('TableExpr - subquery', () => {
  const sql = 'SELECT * FROM (SELECT id FROM users) AS sub';
  const ast = parser.astify(sql) as Select;
  const from = (ast.from as From[])[0] as TableExpr;
  
  console.log('TableExpr with AS:', JSON.stringify(from, null, 2));
  assert.ok(from.expr);
  assert.ok(from.expr.ast);
  assert.strictEqual('as' in from, true, 'as should be present');
  assert.strictEqual(from.as, 'sub');
});

test('TableExpr - subquery without alias', () => {
    const sql = 'SELECT * FROM (SELECT id FROM users)';
    const ast = parser.astify(sql) as Select;
    assert.ok(isSelect(ast));
    if (ast.from) {
      const from = (ast.from as From[])[0] as TableExpr;
      console.log('TableExpr without AS - as value:', from.as);
      assert.strictEqual('as' in from, true, 'as should be present');
      // as is present but can be null
    }
});

test('Dual - SELECT without FROM', () => {
  const sql = 'SELECT 1';
  const ast = parser.astify(sql) as Select;
  
  console.log('Dual:', JSON.stringify(ast.from, null, 2));
  if (ast.from) {
    const from = (ast.from as From[])[0] as Dual;
    if (from && 'type' in from) {
      assert.strictEqual(from.type, 'dual');
      assert.strictEqual('loc' in from, true, 'loc should be present or absent');
    }
  }
});

test('BaseFrom - with addition in DELETE', () => {
  const sql = 'DELETE FROM users WHERE id = 1';
  const ast = parser.astify(sql);
  
  console.log('DELETE simple:', JSON.stringify(ast, null, 2));
  
  // Try multi-table delete
  const sql2 = 'DELETE users FROM users JOIN orders ON users.id = orders.user_id WHERE orders.status = "cancelled"';
  const ast2 = parser.astify(sql2);
  console.log('DELETE multi-table:', JSON.stringify(ast2, null, 2));
});
