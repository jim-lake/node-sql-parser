import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateView } from '../../../types.d.ts';
import { isCreate } from './types.guard.ts';

const parser = new Parser();

test('CREATE VIEW - view property with db and view name', () => {
  const sql = 'CREATE VIEW mydb.myview AS SELECT 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.type, 'create');
  assert.strictEqual(create.keyword, 'view');
  assert.strictEqual(create.view.db, 'mydb');
  assert.strictEqual(create.view.view, 'myview');
});

test('CREATE VIEW - view property with view name only', () => {
  const sql = 'CREATE VIEW myview AS SELECT 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.view.db, null);
  assert.strictEqual(create.view.view, 'myview');
});

test('CREATE VIEW - replace property', () => {
  const sql = 'CREATE OR REPLACE VIEW v AS SELECT 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.replace, 'or replace');
});

test('CREATE VIEW - replace null', () => {
  const sql = 'CREATE VIEW v AS SELECT 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.replace, null);
});

test('CREATE VIEW - algorithm UNDEFINED', () => {
  const sql = 'CREATE ALGORITHM = UNDEFINED VIEW v AS SELECT 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.algorithm, 'UNDEFINED');
});

test('CREATE VIEW - algorithm MERGE', () => {
  const sql = 'CREATE ALGORITHM = MERGE VIEW v AS SELECT 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.algorithm, 'MERGE');
});

test('CREATE VIEW - algorithm TEMPTABLE', () => {
  const sql = 'CREATE ALGORITHM = TEMPTABLE VIEW v AS SELECT 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.algorithm, 'TEMPTABLE');
});

test('CREATE VIEW - sql_security DEFINER', () => {
  const sql = 'CREATE SQL SECURITY DEFINER VIEW v AS SELECT 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.sql_security, 'DEFINER');
});

test('CREATE VIEW - sql_security INVOKER', () => {
  const sql = 'CREATE SQL SECURITY INVOKER VIEW v AS SELECT 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.sql_security, 'INVOKER');
});

test('CREATE VIEW - columns property as string array', () => {
  const sql = 'CREATE VIEW myview (col1, col2) AS SELECT 1, 2';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.ok(Array.isArray(create.columns));
  assert.strictEqual(create.columns!.length, 2);
  assert.strictEqual(create.columns![0], 'col1');
  assert.strictEqual(create.columns![1], 'col2');
});

test('CREATE VIEW - columns property null', () => {
  const sql = 'CREATE VIEW myview AS SELECT 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.columns, null);
});

test('CREATE VIEW - with CASCADED CHECK OPTION', () => {
  const sql = 'CREATE VIEW myview AS SELECT 1 WITH CASCADED CHECK OPTION';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.with, 'with cascaded check option');
});

test('CREATE VIEW - with LOCAL CHECK OPTION', () => {
  const sql = 'CREATE VIEW myview AS SELECT 1 WITH LOCAL CHECK OPTION';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.with, 'with local check option');
});

test('CREATE VIEW - with CHECK OPTION (no cascaded/local)', () => {
  const sql = 'CREATE VIEW myview AS SELECT 1 WITH CHECK OPTION';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.with, 'with check option');
});

test('CREATE VIEW - with property null', () => {
  const sql = 'CREATE VIEW myview AS SELECT 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.with, null);
});

test('CREATE VIEW - all properties combined', () => {
  const sql = "CREATE OR REPLACE ALGORITHM = MERGE DEFINER = 'user'@'host' SQL SECURITY INVOKER VIEW mydb.myview (col1, col2) AS SELECT 1, 2 WITH LOCAL CHECK OPTION";
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.type, 'create');
  assert.strictEqual(create.keyword, 'view');
  assert.strictEqual(create.replace, 'or replace');
  assert.strictEqual(create.algorithm, 'MERGE');
  assert.ok(create.definer);
  assert.strictEqual(create.sql_security, 'INVOKER');
  assert.strictEqual(create.view.db, 'mydb');
  assert.strictEqual(create.view.view, 'myview');
  assert.ok(create.columns);
  assert.strictEqual(create.columns!.length, 2);
  assert.ok(create.select);
  assert.strictEqual(create.with, 'with local check option');
});

test('CREATE VIEW - definer property as Binary', () => {
  const sql = "CREATE DEFINER = 'user'@'host' VIEW v AS SELECT 1";
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.ok(create.definer);
  assert.strictEqual(create.definer.type, 'binary_expr');
});

test('CREATE VIEW - definer null', () => {
  const sql = 'CREATE VIEW v AS SELECT 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.definer, null);
});

test('CREATE VIEW - algorithm null', () => {
  const sql = 'CREATE VIEW v AS SELECT 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.algorithm, null);
});

test('CREATE VIEW - sql_security null', () => {
  const sql = 'CREATE VIEW v AS SELECT 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.strictEqual(create.sql_security, null);
});

test('CREATE VIEW - select property is Select type', () => {
  const sql = 'CREATE VIEW v AS SELECT * FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast));
  const create = ast as CreateView;
  assert.ok(create.select);
  assert.strictEqual(create.select.type, 'select');
});
