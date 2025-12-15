import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Create, CreateColumnDefinition } from '../../../types.d.ts';
import { isCreate, isCreateColumnDefinition } from './types.guard.ts';

const parser = new Parser();

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
