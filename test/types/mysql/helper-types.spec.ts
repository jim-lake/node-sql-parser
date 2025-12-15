import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { Parser } from './parser-loader.mjs';
import {
  isSelect,
  isCreate,
  isWindowExpr,
  isNamedWindowExpr,
  isTriggerEvent,
  isTableOption,
} from './types.guard.js';
import type { Select, Create } from '../../types.js';

const parser = new Parser();

test('WindowExpr in SELECT with WINDOW clause', () => {
  const sql = `SELECT id, ROW_NUMBER() OVER w FROM t WINDOW w AS (ORDER BY id)`;
  const ast = parser.astify(sql);

  assert(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert(isWindowExpr(selectAst.window));
  assert(isNamedWindowExpr(selectAst.window.expr[0]));
});

test('TriggerEvent in CREATE TRIGGER', () => {
  const sql = `CREATE TRIGGER my_trigger BEFORE INSERT ON t FOR EACH ROW SET x = 1`;
  const ast = parser.astify(sql);

  assert(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert(isTriggerEvent(createAst.events[0]));
});

test('TableOption in CREATE TABLE', () => {
  const sql = `CREATE TABLE t (id INT) ENGINE=InnoDB AUTO_INCREMENT=100`;
  const ast = parser.astify(sql);

  assert(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert(isTableOption(createAst.table_options[0]));
});
