import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import { isCreate, isCreateTrigger, isBinary } from './types.guard.ts';

const parser = new Parser();

test('CreateTrigger - basic BEFORE INSERT', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
});

test('CreateTrigger - AFTER UPDATE', () => {
  const sql = 'CREATE TRIGGER update_trigger AFTER UPDATE ON users FOR EACH ROW SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
});

test('CreateTrigger - AFTER DELETE', () => {
  const sql = 'CREATE TRIGGER delete_trigger AFTER DELETE ON users FOR EACH ROW SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
});

test('CreateTrigger - with definer', () => {
  const sql = "CREATE DEFINER = 'admin'@'localhost' TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()";
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
  assert.ok(isBinary(ast.definer), 'Definer should be Binary');
});

test('CreateTrigger - trigger with db.table name', () => {
  const sql = 'CREATE TRIGGER mydb.my_trigger BEFORE INSERT ON mydb.users FOR EACH ROW SET NEW.created_at = NOW()';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
});

test('CreateTrigger - table property', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
});

test('CreateTrigger - for_each property', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
});

test('CreateTrigger - for_each with STATEMENT', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH STATEMENT SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
});

test('CreateTrigger - execute property', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
});

test('CreateTrigger - with FOLLOWS order', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW FOLLOWS other_trigger SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
});

test('CreateTrigger - with PRECEDES order', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW PRECEDES other_trigger SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
});

test('CreateTrigger - TriggerEvent type', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
});

test('CreateTrigger - if_not_exists property', () => {
  const sql = 'CREATE TRIGGER IF NOT EXISTS my_trigger BEFORE INSERT ON users FOR EACH ROW SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
});

test('CreateTrigger - if_not_exists null', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
});

test('CreateTrigger - definer null', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
});

test('CreateTrigger - order null', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'Should be Create');
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
});

test('CreateTrigger - time property values', () => {
  
});
