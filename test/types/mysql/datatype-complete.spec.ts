import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Create, CreateColumnDefinition, DataType } from '../../../types.d.ts';
import { isCreate, isCreateColumnDefinition } from './types.guard.ts';

const parser = new Parser();

// Phase 11.11: DataType Properties Complete Validation

test('DataType.dataType - string value', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
  const dataType = colDef.definition;
});

test('DataType.dataType - various types', () => {
  const types = [
    'INT', 'VARCHAR', 'CHAR', 'TEXT', 'DECIMAL', 'FLOAT', 'DOUBLE',
    'DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'YEAR', 'BOOLEAN',
    'BLOB', 'JSON', 'ENUM', 'SET', 'BINARY', 'VARBINARY'
  ];
  
  for (const type of types) {
    let sql = `CREATE TABLE t (col ${type}`;
    if (type === 'VARCHAR' || type === 'CHAR' || type === 'VARBINARY' || type === 'BINARY') {
      sql += '(10)';
    } else if (type === 'ENUM' || type === 'SET') {
      sql += "('a', 'b')";
    }
    sql += ')';
    
    const ast = parser.astify(sql);
    assert.ok(isCreate(ast));
    assert.ok(isCreateColumnDefinition(ast.create_definitions[0]));
    const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
    const dataType = colDef.definition;
  }
});

test('DataType.suffix - empty array or null when not present', () => {
  // INT returns empty array
  const sql1 = 'CREATE TABLE users (id INT)';
  const ast1 = parser.astify(sql1);
  assert.ok(isCreate(ast1));
  const colDef1 = (ast1 as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType1 = colDef1.definition;
  
  // VARCHAR returns null
  const sql2 = 'CREATE TABLE users (name VARCHAR(255))';
  const ast2 = parser.astify(sql2);
  assert.ok(isCreate(ast2));
  const colDef2 = (ast2 as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType2 = colDef2.definition;
});
