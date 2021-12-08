/*! SPDX-License-Identifier: MIT */

import test from 'ava';
import { platform, EOL } from 'os';
import { Buffer } from 'buffer';

import { identity, constant } from 'sharg-quote/lib/fun';
import { warg } from 'sharg-quote';
import { wcmd } from 'sharg-quote/lib';

import {
  emptyElementNotAllowedMessage,
  validateNotEmpty,
  foldMap,
  asyncChildProcess as acp,
} from '../build/helper.js';

import { run as run_sh_sa } from '../build/sh_spawn_sa.js';
import { run as run_sh_xc } from '../build/sh_spawn_xc.js';
import { run as run_pwsh_sa } from '../build/pwsh_spawn_sa.js';
import { run as run_pwsh_xc } from '../build/pwsh_spawn_xc.js';
import { run as run_wcmd_sa } from '../build/wcmd_spawn_sa.js';
import { run as run_wcmd_xc } from '../build/wcmd_spawn_xc.js';

const isWin = platform() === 'win32';

test('fun', (t) => {
  t.is(identity(-1), -1);
  t.deepEqual(constant([`foo`, `bar`])(), [`foo`, `bar`]);
});

test('validateNotEmpty', (t) => {
  t.throws(
    () => {
      validateNotEmpty(``);
    },
    { message: emptyElementNotAllowedMessage }
  );

  t.is(validateNotEmpty(`foo`), `foo`);
});

test('foldMap', (t) => {
  const fm = foldMap((s) => s.toUpperCase());
  t.is(fm([`foo`, `Bar Baz`]), `FOO BAR BAZ`);
});

test('warg', (t) => {
  t.is(warg.quote(`a\nb`), `a\nb`);
  t.is(warg.quote(`a"b`), `"a\\"b"`);
});

test('wcmd', (t) => {
  t.is(wcmd.quote(`a\nb`), `"a b"`);
  t.is(wcmd.quote(`a"b`), `^"a\\^"b^"`);
});

(isWin ? test.skip : test)('sh spawn sa', async (t) => {
  t.deepEqual(await acp(run_sh_sa()), Buffer.from(`[foo, bar " ' baz]\n`));
});

(isWin ? test.skip : test)('sh spawn xc', async (t) => {
  t.deepEqual(await acp(run_sh_xc()), Buffer.from(`foo bar " ' baz 3${EOL}`));
});

(isWin ? test : test.skip)('pwsh spawn sa', async (t) => {
  t.deepEqual(await acp(run_pwsh_sa()), Buffer.from(`[foo, bar " ' baz]\n`));
});

(isWin ? test : test.skip)('pwsh spawn xc', async (t) => {
  t.deepEqual(
    await acp(run_pwsh_xc()),
    Buffer.from(`foo${EOL}bar " ' baz${EOL}3${EOL}`)
  );
});

(isWin ? test : test.skip)('wcmd spawn sa', async (t) => {
  t.deepEqual(await acp(run_wcmd_sa()), Buffer.from(`[foo, bar " ' baz]\n`));
});

(isWin ? test : test.skip)('wcmd spawn xc', async (t) => {
  t.deepEqual(
    await acp(run_wcmd_xc()),
    Buffer.from(`foo bar " ' baz Windows_NT${EOL}`)
  );
});
