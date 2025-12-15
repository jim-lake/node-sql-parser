import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Delete, From, Binary } from '../../types.d.ts';
import { isDelete, isBinary } from './types.guard.ts';

const parser = new Parser();

