import assert from 'node:assert';

export function assertType(func: any, ast: any, reason?: string) {
  const ok = func(ast);
  if (!ok) {
    console.log("checker:", func, 'fails for ast:', JSON.stringify(ast, null, 2));
  }
  assert.ok(ok, reason);
}
