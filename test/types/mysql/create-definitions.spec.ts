import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateColumnDefinition, CreateIndexDefinition, CreateFulltextSpatialIndexDefinition } from '../../types.d.ts';
import { isCreate, isCreateColumnDefinition, isCreateIndexDefinition, isCreateFulltextSpatialIndexDefinition } from './types.guard.ts';

const parser = new Parser();

test('CREATE TABLE with column definition - INT NOT NULL', () => {
  const sql = 'CREATE TABLE users (id INT NOT NULL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  const colDef = ast.create_definitions![0] as CreateColumnDefinition;
  
  assert.ok(isCreateColumnDefinition(colDef), 'Should be CreateColumnDefinition');
});

test('CREATE TABLE with column definition - VARCHAR with DEFAULT', () => {
  const sql = "CREATE TABLE users (name VARCHAR(255) DEFAULT 'unknown')";
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  const colDef = ast.create_definitions![0] as CreateColumnDefinition;
  
  assert.ok(isCreateColumnDefinition(colDef), 'Should be CreateColumnDefinition');
});

test('CREATE TABLE with column definition - AUTO_INCREMENT', () => {
  const sql = 'CREATE TABLE users (id INT AUTO_INCREMENT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  const colDef = ast.create_definitions![0] as CreateColumnDefinition;
  
  assert.ok(isCreateColumnDefinition(colDef), 'Should be CreateColumnDefinition');
});

test('CREATE TABLE with INDEX definition', () => {
  const sql = 'CREATE TABLE users (id INT, name VARCHAR(255), INDEX idx_name (name))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  const indexDef = ast.create_definitions![2] as CreateIndexDefinition;
  
  assert.ok(isCreateIndexDefinition(indexDef), 'Should be CreateIndexDefinition');
});

test('CREATE TABLE with KEY definition', () => {
  const sql = 'CREATE TABLE users (id INT, KEY (id))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  const indexDef = ast.create_definitions![1] as CreateIndexDefinition;
  
  assert.ok(isCreateIndexDefinition(indexDef), 'Should be CreateIndexDefinition');
});

test('CREATE TABLE with FULLTEXT INDEX', () => {
  const sql = 'CREATE TABLE articles (id INT, content TEXT, FULLTEXT INDEX ft_content (content))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  const ftIndex = ast.create_definitions![2] as CreateFulltextSpatialIndexDefinition;
  
  assert.ok(isCreateFulltextSpatialIndexDefinition(ftIndex), 'Should be CreateFulltextSpatialIndexDefinition');
});
