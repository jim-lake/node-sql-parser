import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Create, TriggerEvent, UserAuthOption } from '../../types.d.ts';

const parser = new Parser();

test('CREATE TRIGGER', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()';
  const ast = parser.astify(sql) as Create;
  
  assert.strictEqual(ast.type, 'create');
  assert.strictEqual(ast.keyword, 'trigger');
  assert.ok(ast.for_each);
  assert.ok(Array.isArray(ast.events));
  const event = ast.events![0] as TriggerEvent;
  assert.strictEqual(event.keyword, 'insert');
});

test('CREATE VIEW', () => {
  const sql = 'CREATE VIEW user_view AS SELECT id, name FROM users';
  const ast = parser.astify(sql) as Create;
  
  assert.strictEqual(ast.type, 'create');
  assert.strictEqual(ast.keyword, 'view');
  assert.ok(ast.view);
  assert.ok(ast.select);
});

test('CREATE USER - user is UserAuthOption array', () => {
  const sql = "CREATE USER 'testuser'@'localhost' IDENTIFIED BY 'password'";
  const ast = parser.astify(sql) as Create;
  
  assert.strictEqual(ast.type, 'create');
  assert.strictEqual(ast.keyword, 'user');
  assert.ok(Array.isArray(ast.user));
  const user = ast.user![0] as UserAuthOption;
  assert.ok(user);
  assert.ok(user.auth_option);
});
