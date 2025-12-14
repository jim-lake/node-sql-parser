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
  assert.strictEqual(typeof dataType.dataType, 'string');
  assert.strictEqual(dataType.dataType, 'INT');
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
    const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
    const dataType = colDef.definition;
    assert.strictEqual(dataType.dataType, type);
  }
});

test('DataType.length - number present', () => {
  const sql = 'CREATE TABLE users (name VARCHAR(255))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType = colDef.definition;
  assert.strictEqual(typeof dataType.length, 'number');
  assert.strictEqual(dataType.length, 255);
});

test('DataType.length - undefined when not present', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType = colDef.definition;
  assert.strictEqual(dataType.length, undefined);
});

test('DataType.parentheses - true when present', () => {
  const sql = 'CREATE TABLE users (name VARCHAR(255))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType = colDef.definition;
  assert.strictEqual(dataType.parentheses, true);
});

test('DataType.parentheses - undefined when not present', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType = colDef.definition;
  assert.strictEqual(dataType.parentheses, undefined);
});

test('DataType.scale - number present', () => {
  const sql = 'CREATE TABLE products (price DECIMAL(10, 2))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType = colDef.definition;
  assert.strictEqual(typeof dataType.scale, 'number');
  assert.strictEqual(dataType.scale, 2);
});

test('DataType.scale - undefined when not present', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType = colDef.definition;
  assert.strictEqual(dataType.scale, undefined);
});

test('DataType.suffix - UNSIGNED array', () => {
  const sql = 'CREATE TABLE users (age INT UNSIGNED)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType = colDef.definition;
  assert.ok(Array.isArray(dataType.suffix));
  assert.ok(dataType.suffix.includes('UNSIGNED'));
});

test('DataType.suffix - ZEROFILL array', () => {
  const sql = 'CREATE TABLE users (age INT ZEROFILL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType = colDef.definition;
  assert.ok(Array.isArray(dataType.suffix));
  assert.ok(dataType.suffix.includes('ZEROFILL'));
});

test('DataType.suffix - UNSIGNED ZEROFILL array', () => {
  const sql = 'CREATE TABLE users (age INT UNSIGNED ZEROFILL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType = colDef.definition;
  assert.ok(Array.isArray(dataType.suffix));
  assert.strictEqual(dataType.suffix.length, 2);
  assert.ok(dataType.suffix.includes('UNSIGNED'));
  assert.ok(dataType.suffix.includes('ZEROFILL'));
});

test('DataType.suffix - empty array or null when not present', () => {
  // INT returns empty array
  const sql1 = 'CREATE TABLE users (id INT)';
  const ast1 = parser.astify(sql1);
  assert.ok(isCreate(ast1));
  const colDef1 = (ast1 as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType1 = colDef1.definition;
  assert.ok(Array.isArray(dataType1.suffix));
  assert.strictEqual(dataType1.suffix.length, 0);
  
  // VARCHAR returns null
  const sql2 = 'CREATE TABLE users (name VARCHAR(255))';
  const ast2 = parser.astify(sql2);
  assert.ok(isCreate(ast2));
  const colDef2 = (ast2 as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType2 = colDef2.definition;
  assert.strictEqual(dataType2.suffix, null);
});

test('DataType.expr - Expr for ENUM', () => {
  const sql = "CREATE TABLE users (status ENUM('active', 'inactive'))";
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType = colDef.definition;
  assert.ok(dataType.expr);
  assert.strictEqual(dataType.expr.type, 'expr_list');
});

test('DataType.expr - ExprList for SET', () => {
  const sql = "CREATE TABLE users (permissions SET('read', 'write', 'execute'))";
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType = colDef.definition;
  assert.ok(dataType.expr);
  assert.strictEqual(dataType.expr.type, 'expr_list');
});

test('DataType.expr - undefined when not present', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType = colDef.definition;
  assert.strictEqual(dataType.expr, undefined);
});

test('DataType - all properties combined', () => {
  const sql = 'CREATE TABLE products (price DECIMAL(10, 2) UNSIGNED)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const colDef = (ast as Create).create_definitions[0] as CreateColumnDefinition;
  const dataType = colDef.definition;
  
  // Verify all properties
  assert.strictEqual(dataType.dataType, 'DECIMAL');
  assert.strictEqual(dataType.length, 10);
  assert.strictEqual(dataType.scale, 2);
  assert.strictEqual(dataType.parentheses, true);
  assert.ok(Array.isArray(dataType.suffix));
  assert.ok(dataType.suffix.includes('UNSIGNED'));
});
