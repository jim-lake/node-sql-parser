import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Show, Explain, Call, Set, Lock, Unlock, Transaction, LockTable } from '../../types.d.ts';
import { isShow, isCall, isSet, isLock, isUnlock, isExplain, isTransaction } from './types.guard.ts';

const parser = new Parser();

