import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { Parser } from './parser-loader.mjs';
import {
  isWindowExpr,
  isNamedWindowExpr,
  isTriggerEvent,
  isTableOption,
} from './types.guard.js';
import type { Select, Create } from '../../types.js';

const parser = new Parser();

describe('Helper Types', () => {
  test('WindowExpr in SELECT with WINDOW clause', () => {
    const sql = `SELECT id, ROW_NUMBER() OVER w FROM t WINDOW w AS (ORDER BY id)`;
    const ast = parser.astify(sql) as Select;
    
    assert(typeof ast === 'object' && ast !== null);
    assert(ast.type === 'select');
    assert(ast.window !== undefined && ast.window !== null);
    assert(isWindowExpr(ast.window));
    assert(ast.window.keyword === 'window');
    assert(Array.isArray(ast.window.expr));
    assert(ast.window.expr.length > 0);
    assert(isNamedWindowExpr(ast.window.expr[0]));
  });

  test('TriggerEvent in CREATE TRIGGER', () => {
    const sql = `CREATE TRIGGER my_trigger BEFORE INSERT ON t FOR EACH ROW SET x = 1`;
    const ast = parser.astify(sql) as Create;
    
    assert(typeof ast === 'object' && ast !== null);
    assert(ast.type === 'create');
    assert(ast.events !== undefined && ast.events !== null);
    assert(Array.isArray(ast.events));
    assert(ast.events.length > 0);
    assert(isTriggerEvent(ast.events[0]));
    assert(ast.events[0].keyword === 'insert');
  });

  test('TableOption in CREATE TABLE', () => {
    const sql = `CREATE TABLE t (id INT) ENGINE=InnoDB AUTO_INCREMENT=100`;
    const ast = parser.astify(sql) as Create;
    
    assert(typeof ast === 'object' && ast !== null);
    assert(ast.type === 'create');
    assert(ast.table_options !== undefined && ast.table_options !== null);
    assert(Array.isArray(ast.table_options));
    assert(ast.table_options.length > 0);
    assert(isTableOption(ast.table_options[0]));
  });
});
