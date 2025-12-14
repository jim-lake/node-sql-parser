import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Create, CreateColumnDefinition, CreateConstraintForeign, OnReference } from '../../../types.d.ts';
import { isCreate, isCreateColumnDefinition } from './types.guard.ts';

const parser = new Parser();

// Phase 11.14: OnReference Properties Complete Validation

test('OnReference.type - on delete', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON DELETE CASCADE)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const onRef = colDef.reference_definition.on_action[0];
  assert.strictEqual(onRef.type, 'on delete');
});

test('OnReference.type - on update', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON UPDATE RESTRICT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const onRef = colDef.reference_definition.on_action[0];
  assert.strictEqual(onRef.type, 'on update');
});

test('OnReference.keyword - not present in parser output', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON DELETE CASCADE)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const onRef = colDef.reference_definition.on_action[0];
  // keyword property is not in parser output - only type and value
  assert.strictEqual(onRef.keyword, undefined);
});

test('OnReference.value - CASCADE as ValueExpr', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON DELETE CASCADE)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const onRef = colDef.reference_definition.on_action[0];
  assert.ok(typeof onRef.value === 'object');
  assert.strictEqual(onRef.value.type, 'origin');
  assert.strictEqual(onRef.value.value, 'cascade');
});

test('OnReference.value - RESTRICT as ValueExpr', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON UPDATE RESTRICT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const onRef = colDef.reference_definition.on_action[0];
  assert.ok(typeof onRef.value === 'object');
  assert.strictEqual(onRef.value.type, 'origin');
  assert.strictEqual(onRef.value.value, 'restrict');
});

test('OnReference.value - SET NULL as ValueExpr', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON DELETE SET NULL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const onRef = colDef.reference_definition.on_action[0];
  assert.ok(typeof onRef.value === 'object');
  assert.strictEqual(onRef.value.type, 'origin');
  assert.strictEqual(onRef.value.value, 'set null');
});

test('OnReference.value - NO ACTION as ValueExpr', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON DELETE NO ACTION)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const onRef = colDef.reference_definition.on_action[0];
  assert.ok(typeof onRef.value === 'object');
  assert.strictEqual(onRef.value.type, 'origin');
  assert.strictEqual(onRef.value.value, 'no action');
});

test('OnReference.value - SET DEFAULT as ValueExpr', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON DELETE SET DEFAULT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const onRef = colDef.reference_definition.on_action[0];
  assert.ok(typeof onRef.value === 'object');
  assert.strictEqual(onRef.value.type, 'origin');
  assert.strictEqual(onRef.value.value, 'set default');
});

test('OnReference.value - CURRENT_TIMESTAMP as ValueExpr', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON UPDATE CURRENT_TIMESTAMP)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const onRef = colDef.reference_definition.on_action[0];
  assert.ok(typeof onRef.value === 'object');
  assert.strictEqual(onRef.value.type, 'origin');
  assert.strictEqual(onRef.value.value, 'current_timestamp');
});

test('OnReference - multiple actions in same reference', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE RESTRICT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  assert.strictEqual(colDef.reference_definition.on_action.length, 2);
  
  const onDelete = colDef.reference_definition.on_action.find(a => a.type === 'on delete');
  const onUpdate = colDef.reference_definition.on_action.find(a => a.type === 'on update');
  
  assert.ok(onDelete);
  assert.strictEqual(onDelete.type, 'on delete');
  assert.ok(typeof onDelete.value === 'object');
  assert.strictEqual(onDelete.value.value, 'cascade');
  
  assert.ok(onUpdate);
  assert.strictEqual(onUpdate.type, 'on update');
  assert.ok(typeof onUpdate.value === 'object');
  assert.strictEqual(onUpdate.value.value, 'restrict');
});

test('OnReference - in FOREIGN KEY constraint', () => {
  const sql = 'CREATE TABLE orders (id INT, user_id INT, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const constraint = (ast as Create).create_definitions.find(def => def.resource === 'constraint') as CreateConstraintForeign;
  assert.ok(constraint);
  assert.ok(constraint.reference_definition);
  const onRef = constraint.reference_definition.on_action[0];
  assert.strictEqual(onRef.type, 'on delete');
  assert.ok(typeof onRef.value === 'object');
  assert.strictEqual(onRef.value.value, 'cascade');
});
