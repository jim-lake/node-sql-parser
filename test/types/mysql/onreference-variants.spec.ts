import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateTable, CreateColumnDefinition, ReferenceDefinition } from '../../../types.d.ts';
import { isCreateTable } from './types.guard.ts';

const parser = new Parser();

test('OnReference type variants', async (t) => {
  await t.test('should handle ON DELETE CASCADE', () => {
    const sql = `CREATE TABLE orders (
      id INT PRIMARY KEY,
      user_id INT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`;
    const ast = parser.astify(sql);
    
    assert.ok(isCreateTable(ast), 'Expected CreateTable AST');
    assert.ok(ast.create_definitions, 'Expected create_definitions');
    
    // Find the foreign key constraint
    const fkConstraint = ast.create_definitions.find(def => 
      def.resource === 'constraint' && def.constraint_type === 'FOREIGN KEY'
    );
    
    assert.ok(fkConstraint, 'Expected foreign key constraint');
    if (fkConstraint && 'reference_definition' in fkConstraint && fkConstraint.reference_definition) {
      const refDef = fkConstraint.reference_definition as ReferenceDefinition;
      assert.ok(refDef.on_action, 'Expected on_action');
      assert.ok(refDef.on_action.length > 0, 'Expected at least one on_action');
      
      const onDelete = refDef.on_action.find(a => a.type === 'on delete');
      assert.ok(onDelete, 'Expected ON DELETE action');
      // Value can be a string or ValueExpr
      const value = typeof onDelete.value === 'string' ? onDelete.value : onDelete.value.value;
      assert.strictEqual(value, 'cascade', 'Expected CASCADE value');
    }
  });

  await t.test('should handle ON UPDATE RESTRICT', () => {
    const sql = `CREATE TABLE orders (
      id INT PRIMARY KEY,
      user_id INT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE RESTRICT
    )`;
    const ast = parser.astify(sql);
    
    assert.ok(isCreateTable(ast), 'Expected CreateTable AST');
    assert.ok(ast.create_definitions, 'Expected create_definitions');
    
    const fkConstraint = ast.create_definitions.find(def => 
      def.resource === 'constraint' && def.constraint_type === 'FOREIGN KEY'
    );
    
    assert.ok(fkConstraint, 'Expected foreign key constraint');
    if (fkConstraint && 'reference_definition' in fkConstraint && fkConstraint.reference_definition) {
      const refDef = fkConstraint.reference_definition as ReferenceDefinition;
      const onUpdate = refDef.on_action.find(a => a.type === 'on update');
      assert.ok(onUpdate, 'Expected ON UPDATE action');
      const value = typeof onUpdate.value === 'string' ? onUpdate.value : onUpdate.value.value;
      assert.strictEqual(value, 'restrict', 'Expected RESTRICT value');
    }
  });

  await t.test('should handle both ON DELETE and ON UPDATE', () => {
    const sql = `CREATE TABLE orders (
      id INT PRIMARY KEY,
      user_id INT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
    )`;
    const ast = parser.astify(sql);
    
    assert.ok(isCreateTable(ast), 'Expected CreateTable AST');
    assert.ok(ast.create_definitions, 'Expected create_definitions');
    
    const fkConstraint = ast.create_definitions.find(def => 
      def.resource === 'constraint' && def.constraint_type === 'FOREIGN KEY'
    );
    
    assert.ok(fkConstraint, 'Expected foreign key constraint');
    if (fkConstraint && 'reference_definition' in fkConstraint && fkConstraint.reference_definition) {
      const refDef = fkConstraint.reference_definition as ReferenceDefinition;
      assert.strictEqual(refDef.on_action.length, 2, 'Expected two on_action items');
      
      const onDelete = refDef.on_action.find(a => a.type === 'on delete');
      const onUpdate = refDef.on_action.find(a => a.type === 'on update');
      
      assert.ok(onDelete, 'Expected ON DELETE action');
      const deleteValue = typeof onDelete.value === 'string' ? onDelete.value : onDelete.value.value;
      assert.strictEqual(deleteValue, 'set null', 'Expected SET NULL value');
      
      assert.ok(onUpdate, 'Expected ON UPDATE action');
      const updateValue = typeof onUpdate.value === 'string' ? onUpdate.value : onUpdate.value.value;
      assert.strictEqual(updateValue, 'cascade', 'Expected CASCADE value');
    }
  });

  await t.test('should handle ON DELETE NO ACTION', () => {
    const sql = `CREATE TABLE orders (
      id INT PRIMARY KEY,
      user_id INT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION
    )`;
    const ast = parser.astify(sql);
    
    assert.ok(isCreateTable(ast), 'Expected CreateTable AST');
    assert.ok(ast.create_definitions, 'Expected create_definitions');
    
    const fkConstraint = ast.create_definitions.find(def => 
      def.resource === 'constraint' && def.constraint_type === 'FOREIGN KEY'
    );
    
    assert.ok(fkConstraint, 'Expected foreign key constraint');
    if (fkConstraint && 'reference_definition' in fkConstraint && fkConstraint.reference_definition) {
      const refDef = fkConstraint.reference_definition as ReferenceDefinition;
      const onDelete = refDef.on_action.find(a => a.type === 'on delete');
      assert.ok(onDelete, 'Expected ON DELETE action');
      const value = typeof onDelete.value === 'string' ? onDelete.value : onDelete.value.value;
      assert.strictEqual(value, 'no action', 'Expected NO ACTION value');
    }
  });
});
