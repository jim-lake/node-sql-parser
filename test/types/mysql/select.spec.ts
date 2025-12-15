import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Column, ColumnRef, From, Binary, OrderBy } from '../../types.d.ts';
import { isSelect, isColumnRef } from './types.guard.ts';

const parser = new Parser();


