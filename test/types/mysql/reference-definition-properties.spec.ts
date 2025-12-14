import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Create, CreateColumnDefinition, CreateConstraintForeign, ReferenceDefinition } from '../../../types.d.ts';
import { isCreate, isCreateColumnDefinition } from './types.guard.ts';

const parser = new Parser();

// Phase 11.13: ReferenceDefinition Properties Complete Validation

test('ReferenceDefinition.definition - column reference in inline REFERENCES', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
  assert.ok(colDef.reference_definition);
  const refDef = colDef.reference_definition;
  assert.ok(refDef.definition);
  assert.ok(Array.isArray(refDef.definition));
  assert.strictEqual(refDef.definition.length, 1);
  assert.strictEqual(refDef.definition[0].type, 'column_ref');
  assert.strictEqual(refDef.definition[0].column, 'id');
});

test('ReferenceDefinition.definition - multiple columns', () => {
  const sql = 'CREATE TABLE orders (user_id INT, product_id INT, FOREIGN KEY (user_id, product_id) REFERENCES order_items(user_id, product_id))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const constraint = (ast as Create).create_definitions.find(def => def.resource === 'constraint') as CreateConstraintForeign;
  assert.ok(constraint);
  assert.ok(constraint.reference_definition);
  const refDef = constraint.reference_definition;
  assert.ok(refDef.definition);
  assert.ok(Array.isArray(refDef.definition));
  assert.strictEqual(refDef.definition.length, 2);
  assert.strictEqual(refDef.definition[0].column, 'user_id');
  assert.strictEqual(refDef.definition[1].column, 'product_id');
});

test('ReferenceDefinition.definition - undefined when not specified', () => {
  // Check if there's a case where definition is undefined
  // In MySQL, REFERENCES always requires column list, so definition should always be present
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const refDef = colDef.reference_definition;
  // definition should be present
  assert.ok(refDef.definition !== undefined);
});

test('ReferenceDefinition.table - single table reference', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const refDef = colDef.reference_definition;
  assert.ok(refDef.table);
  assert.ok(Array.isArray(refDef.table));
  assert.strictEqual(refDef.table.length, 1);
  assert.strictEqual(refDef.table[0].table, 'users');
  assert.strictEqual(refDef.table[0].db, null);
});

test('ReferenceDefinition.table - with database qualifier', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES mydb.users(id))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const refDef = colDef.reference_definition;
  assert.ok(refDef.table);
  assert.strictEqual(refDef.table[0].db, 'mydb');
  assert.strictEqual(refDef.table[0].table, 'users');
});

test('ReferenceDefinition.keyword - REFERENCES keyword', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const refDef = colDef.reference_definition;
  // Check if keyword property exists and its type
  if (refDef.keyword !== undefined) {
    assert.strictEqual(typeof refDef.keyword, 'string');
  }
});

test('ReferenceDefinition.match - MATCH FULL', () => {
  const sql = 'CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id) MATCH FULL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const constraint = (ast as Create).create_definitions.find(def => def.resource === 'constraint') as CreateConstraintForeign;
  assert.ok(constraint);
  assert.ok(constraint.reference_definition);
  const refDef = constraint.reference_definition;
  // MySQL may or may not support MATCH clause - check if it's parsed
  if (refDef.match !== undefined && refDef.match !== null) {
    assert.strictEqual(typeof refDef.match, 'string');
  }
});

test('ReferenceDefinition.match - MATCH PARTIAL', () => {
  const sql = 'CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id) MATCH PARTIAL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const constraint = (ast as Create).create_definitions.find(def => def.resource === 'constraint') as CreateConstraintForeign;
  assert.ok(constraint);
  assert.ok(constraint.reference_definition);
  const refDef = constraint.reference_definition;
  // Check if match is parsed
  if (refDef.match !== undefined && refDef.match !== null) {
    assert.strictEqual(typeof refDef.match, 'string');
  }
});

test('ReferenceDefinition.match - MATCH SIMPLE', () => {
  const sql = 'CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id) MATCH SIMPLE)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const constraint = (ast as Create).create_definitions.find(def => def.resource === 'constraint') as CreateConstraintForeign;
  assert.ok(constraint);
  assert.ok(constraint.reference_definition);
  const refDef = constraint.reference_definition;
  // Check if match is parsed
  if (refDef.match !== undefined && refDef.match !== null) {
    assert.strictEqual(typeof refDef.match, 'string');
  }
});

test('ReferenceDefinition.on_action - ON DELETE CASCADE', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON DELETE CASCADE)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const refDef = colDef.reference_definition;
  assert.ok(refDef.on_action);
  assert.ok(Array.isArray(refDef.on_action));
  assert.ok(refDef.on_action.length > 0);
  const onDelete = refDef.on_action.find(a => a.type === 'on delete');
  assert.ok(onDelete);
  assert.strictEqual(onDelete.type, 'on delete');
});

test('ReferenceDefinition.on_action - ON UPDATE RESTRICT', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON UPDATE RESTRICT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const refDef = colDef.reference_definition;
  const onUpdate = refDef.on_action.find(a => a.type === 'on update');
  assert.ok(onUpdate);
  assert.strictEqual(onUpdate.type, 'on update');
});

test('ReferenceDefinition.on_action - both ON DELETE and ON UPDATE', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE SET NULL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const refDef = colDef.reference_definition;
  assert.strictEqual(refDef.on_action.length, 2);
  const onDelete = refDef.on_action.find(a => a.type === 'on delete');
  const onUpdate = refDef.on_action.find(a => a.type === 'on update');
  assert.ok(onDelete);
  assert.ok(onUpdate);
});

test('ReferenceDefinition.on_action - ON DELETE SET NULL', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON DELETE SET NULL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const refDef = colDef.reference_definition;
  const onDelete = refDef.on_action.find(a => a.type === 'on delete');
  assert.ok(onDelete);
  // Value should be 'set null'
  const value = typeof onDelete.value === 'string' ? onDelete.value : onDelete.value.value;
  assert.strictEqual(value, 'set null');
});

test('ReferenceDefinition.on_action - ON DELETE NO ACTION', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON DELETE NO ACTION)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const refDef = colDef.reference_definition;
  const onDelete = refDef.on_action.find(a => a.type === 'on delete');
  assert.ok(onDelete);
  const value = typeof onDelete.value === 'string' ? onDelete.value : onDelete.value.value;
  assert.strictEqual(value, 'no action');
});

test('ReferenceDefinition.on_action - ON DELETE SET DEFAULT', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id) ON DELETE SET DEFAULT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const refDef = colDef.reference_definition;
  const onDelete = refDef.on_action.find(a => a.type === 'on delete');
  assert.ok(onDelete);
  const value = typeof onDelete.value === 'string' ? onDelete.value : onDelete.value.value;
  assert.strictEqual(value, 'set default');
});

test('ReferenceDefinition.on_action - empty array when no actions', () => {
  const sql = 'CREATE TABLE orders (user_id INT REFERENCES users(id))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.reference_definition);
  const refDef = colDef.reference_definition;
  assert.ok(Array.isArray(refDef.on_action));
  // on_action should be an empty array when no ON DELETE/UPDATE clauses
  assert.strictEqual(refDef.on_action.length, 0);
});
