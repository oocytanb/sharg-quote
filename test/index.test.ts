/*! SPDX-License-Identifier: MIT */

import test from 'ava';

import { Buffer } from 'buffer';
import { platform, EOL } from 'os';
import { spawnSync } from 'child_process';

import { fun, xarg, xcommand, warg, wcmd, pwsh, sh } from '../lib/index.js';

const isWin = platform() === 'win32';

test('fun', (t) => {
  const { identity, constant } = fun;

  t.is(identity(-1), -1);
  t.deepEqual(constant([`foo`, `bar`])(), [`foo`, `bar`]);
});

test('xarg', (t) => {
  const { concat, empty } = xarg;

  t.is(
    concat(
      concat(`foo`, concat(concat(`bar`, empty), `"baz"`)),
      concat(`qux quux`, `"corge grault"`)
    ),
    `foo bar "baz" qux quux "corge grault"`
  );
});

test('xcommand', (t) => {
  const { emptyElementNotAllowedMessage, validateNotEmpty } = xcommand;

  t.throws(
    () => {
      validateNotEmpty(``);
    },
    { message: emptyElementNotAllowedMessage }
  );

  t.is(validateNotEmpty(`foo`), `foo`);
});

test('warg', (t) => {
  const { concat, empty } = xarg;
  const { quote: q } = warg;

  t.is(q(`foo`), `foo`);
  t.is(q(`foo bar`), `"foo bar"`);
  t.is(q(`fo"o ba\\'r\\`), `"fo\\"o ba\\'r\\\\"`);

  t.is([q(`foo`), q(`bar baz`)].reduce(concat, empty), `foo "bar baz"`);
});

test('wcmd', (t) => {
  const { quote: q, wCommand: c } = wcmd;

  t.is(q(`foo bar baz="\\"`), `^"foo bar baz^=\\^"\\\\\\^"^"`);

  t.deepEqual(c([q(`foo`), q(`bar baz`)]), [
    `cmd.exe`,
    [`/d`, `/s`, `/c`, `"foo "bar baz""`],
  ]);
});

if (isWin) {
  test('wcmd spawn #1', (t) => {
    const { quote: q, wCommand: c } = wcmd;

    const [cmd, args] = c([
      q(`node`),
      q(`test/res/show_args.js`),
      q(`foo`),
      q(`bar " ' baz`),
    ]);

    const { stdout } = spawnSync(cmd, args, {
      windowsVerbatimArguments: true,
    });

    t.deepEqual(stdout, Buffer.from(`[foo, bar " ' baz]\n`));
  });

  test('wcmd spawn #2', (t) => {
    const { escape: esc, quote: q, wCommand: c } = wcmd;

    const [cmd, args] = c([q(`echo`), esc(`foo`), esc(`bar " ' baz`), `%OS%`]);

    const { stdout } = spawnSync(cmd, args, {
      windowsVerbatimArguments: true,
    });

    t.deepEqual(stdout, Buffer.from(`foo bar " ' baz Windows_NT${EOL}`));
  });
}

test('pwsh', (t) => {
  const { quote: q, wQuote: wq, wCommand: c } = pwsh;

  t.is(q(`foo bar " baz`), `'foo bar " baz'`);
  t.is(wq(`foo bar " baz`), `'"foo bar \\" baz"'`);

  t.deepEqual(c([q(`foo`), wq(`bar baz`)]), [
    `pwsh`,
    [`-c`, `"&foo '\\"bar baz\\"'"`],
  ]);
});

if (isWin) {
  test('pwsh spawn #1', (t) => {
    const { quote: q, wQuote: wq, wCommand: c } = pwsh;

    const [cmd, args] = c([
      q(`node`),
      wq(`test/res/show_args.js`),
      wq(`foo`),
      wq(`bar " ' baz`),
    ]);

    const { stdout } = spawnSync(cmd, args, {
      windowsVerbatimArguments: true,
    });

    t.deepEqual(stdout, Buffer.from(`[foo, bar " ' baz]\n`));
  });

  test('pwsh spawn #2', (t) => {
    const { quote: q, wCommand: c } = pwsh;

    const [cmd, args] = c([q(`echo`), q(`foo`), q(`bar " ' baz`), `$(1+2)`]);

    const { stdout } = spawnSync(cmd, args, {
      windowsVerbatimArguments: true,
    });

    t.deepEqual(stdout, Buffer.from(`foo${EOL}bar " ' baz${EOL}3${EOL}`));
  });
}

test('sh', (t) => {
  const { quote: q, command: c } = sh;

  t.is(q(`foo bar 'baz'="\\"`), `'foo bar '\\''baz'\\''="\\"'`);

  t.deepEqual(c([q(`foo`), q(`bar baz`)]), [`sh`, [`-c`, `foo 'bar baz'`]]);
});

if (!isWin) {
  test('sh spawn #1', (t) => {
    const { quote: q, command: c } = sh;

    const [cmd, args] = c([
      q(`node`),
      q(`test/res/show_args.js`),
      q(`foo`),
      q(`bar " ' baz`),
    ]);

    const { stdout } = spawnSync(cmd, args, {
      windowsVerbatimArguments: true,
    });

    t.deepEqual(stdout, Buffer.from(`[foo, bar " ' baz]\n`));
  });

  test('sh spawn #2', (t) => {
    const { quote: q, command: c } = sh;

    const [cmd, args] = c([
      q(`echo`),
      q(`foo`),
      q(`bar " ' baz`),
      '`expr 1 + 2`',
    ]);

    const { stdout } = spawnSync(cmd, args, {
      windowsVerbatimArguments: true,
    });

    t.deepEqual(stdout, Buffer.from(`foo bar " ' baz 3${EOL}`));
  });
}
