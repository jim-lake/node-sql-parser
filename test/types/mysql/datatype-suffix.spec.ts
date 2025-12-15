import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Create, CreateColumnDefinition } from '../../types.d.ts';
import { isCreate, isCreateColumnDefinition } from './types.guard.js';

const parser = new Parser();

test('DataType with UNSIGNED suffix', () => {
  const sql = 'CREATE TABLE users (age INT UNSIGNED)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  
  const colDef = createAst.create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef), 'Should be CreateColumnDefinition');
  
  const dataType = colDef.definition;
});

test('DataType with UNSIGNED ZEROFILL suffix', () => {
  const sql = 'CREATE TABLE users (age INT UNSIGNED ZEROFILL)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  
  const colDef = createAst.create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef), 'Should be CreateColumnDefinition');
  
  const dataType = colDef.definition;
});

test('DataType with ON UPDATE in reference_definition', () => {
  const sql = 'CREATE TABLE users (updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  
  const colDef = createAst.create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef), 'Should be CreateColumnDefinition');
  
  const dataType = colDef.definition;
  
  // ON UPDATE CURRENT_TIMESTAMP is stored in reference_definition.on_action, not in DataType.suffix
  if ('reference_definition' in colDef && colDef.reference_definition) {
    const refDef = colDef.reference_definition as any;
    const onUpdate = refDef.on_action[0];
  }
});
