import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Grant, LoadData } from '../../types.d.ts';

const parser = new Parser();

test('Grant and LoadData types exist', () => {
  // These types are defined in types.d.ts
  // Just verify the types compile
  const grant: Grant | null = null;
  const loadData: LoadData | null = null;
  assert.ok(true);
});
