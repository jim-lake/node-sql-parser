import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateTable, CreateColumnDefinition, CreateIndexDefinition, DataType } from '../../types.d.ts';

const parser = new Parser();

test('DataType - simple INT', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql) as CreateTable;
  const colDef = ast.create_definitions![0] as CreateColumnDefinition;
  const dataType = colDef.definition as DataType;
  
  console.log('DataType INT:', JSON.stringify(dataType, null, 2));
  console.log('Has suffix:', 'suffix' in dataType);
  assert.strictEqual('dataType' in dataType, true, 'dataType should be present');
  // suffix might be present as [] or null, or might be absent
  // length, parentheses, scale, array, expr, quoted are optional
});

test('DataType - VARCHAR with length', () => {
  const sql = 'CREATE TABLE users (name VARCHAR(255))';
  const ast = parser.astify(sql) as CreateTable;
  const colDef = ast.create_definitions![0] as CreateColumnDefinition;
  const dataType = colDef.definition as DataType;
  
  console.log('DataType VARCHAR:', JSON.stringify(dataType, null, 2));
  console.log('VARCHAR has suffix:', 'suffix' in dataType);
  assert.strictEqual(dataType.length, 255);
});

test('DataType - TEXT', () => {
  const sql = 'CREATE TABLE articles (content TEXT)';
  const ast = parser.astify(sql) as CreateTable;
  const colDef = ast.create_definitions![0] as CreateColumnDefinition;
  const dataType = colDef.definition as DataType;
  
  console.log('DataType TEXT:', JSON.stringify(dataType, null, 2));
  console.log('TEXT has suffix:', 'suffix' in dataType);
});

test('CreateColumnDefinition - simple', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql) as CreateTable;
  const colDef = ast.create_definitions![0] as CreateColumnDefinition;
  
  console.log('CreateColumnDefinition:', JSON.stringify(colDef, null, 2));
  assert.strictEqual('column' in colDef, true, 'column should be present');
  assert.strictEqual('definition' in colDef, true, 'definition should be present');
  assert.strictEqual('resource' in colDef, true, 'resource should be present');
  // All ColumnDefinitionOptList properties are optional
});

test('CreateColumnDefinition - with NOT NULL', () => {
  const sql = 'CREATE TABLE users (id INT NOT NULL)';
  const ast = parser.astify(sql) as CreateTable;
  const colDef = ast.create_definitions![0] as CreateColumnDefinition;
  
  console.log('CreateColumnDefinition NOT NULL:', JSON.stringify(colDef, null, 2));
  assert.ok(colDef.nullable);
});

test('CreateIndexDefinition - simple', () => {
  const sql = 'CREATE TABLE users (id INT, INDEX idx_id (id))';
  const ast = parser.astify(sql) as CreateTable;
  const indexDef = ast.create_definitions![1] as CreateIndexDefinition;
  
  console.log('CreateIndexDefinition:', JSON.stringify(indexDef, null, 2));
  assert.strictEqual('resource' in indexDef, true, 'resource should be present');
  assert.strictEqual('keyword' in indexDef, true, 'keyword should be present');
  assert.strictEqual('definition' in indexDef, true, 'definition should be present');
  assert.strictEqual('index' in indexDef, true, 'index should be present');
  assert.strictEqual('index_type' in indexDef, true, 'index_type should be present');
  assert.strictEqual('index_options' in indexDef, true, 'index_options should be present');
});

test('CreateIndexDefinition - without name', () => {
  const sql = 'CREATE TABLE users (id INT, INDEX (id))';
  const ast = parser.astify(sql) as CreateTable;
  const indexDef = ast.create_definitions![1] as CreateIndexDefinition;
  
  console.log('CreateIndexDefinition no name:', JSON.stringify(indexDef, null, 2));
  assert.strictEqual('index' in indexDef, true, 'index should be present even without name');
});
