/*! SPDX-License-Identifier: MIT */

import test from 'ava';

import { constant } from '../lib/fun.js';
import { Command, emptyElementNotAllowedMessage } from '../lib/xcommand.js';

import {
  customQuote,
  quote as q,
  shell,
  customCommand,
  pShellCommand,
  wShellCommand,
  command,
} from '../lib/sh.js';

test('customQuote', (t) => {
  const cq = customQuote(constant(true));
  t.is(cq(``), `''`);
  t.is(cq(` `), `' '`);
  t.is(cq(`\t`), `'\t'`);
  t.is(cq(`foo`), `'foo'`);
  t.is(cq(`123`), `'123'`);
  t.is(cq(`foo bar`), `'foo bar'`);
  t.is(cq(`'`), `\\'`);
  t.is(cq(`'f'o''o&'`), `\\''f'\\''o'\\'\\''o&'\\'`);
  t.is(cq(`%OS%`), `'%OS%'`);
  t.is(cq(`$SHELL`), `'$SHELL'`);
  t.is(cq(`'$SHELL'`), `\\''$SHELL'\\'`);
});

test('quote', (t) => {
  t.is(q(``), `''`);
  t.is(q(` `), `' '`);
  t.is(q(`\t`), `'\t'`);
  t.is(q(`\n`), `'\n'`);
  t.is(q(`\r`), `'\r'`);
  t.is(q(`foo`), `foo`);
  t.is(q(`123`), `123`);
  t.is(q(`foo bar`), `'foo bar'`);
  t.is(q(`'`), `\\'`);
  t.is(q(`'f'o''o&'`), `\\''f'\\''o'\\'\\''o&'\\'`);
  t.is(q(`%OS%`), `'%OS%'`);
  t.is(q(`$SHELL`), `'$SHELL'`);
  t.is(q(`'$SHELL'`), `\\''$SHELL'\\'`);
});

test('shell', (t) => {
  t.is(shell, `sh`);
});

test('customCommand', (t) => {
  const cc = customCommand((a) => a.toUpperCase())([`-l`]);
  t.throws(() => cc(``));

  const c = cc(`bash`);
  t.throws(() => c([]), { message: emptyElementNotAllowedMessage });
  t.throws(() => c([``]), { message: emptyElementNotAllowedMessage });

  t.deepEqual(c([`foo`, q(`bar BAZ`), `&&`, q(`123 &`), `| p`]), [
    'bash',
    [`-l`, `-c`, `FOO 'BAR BAZ' && '123 &' | P`],
  ]);
});

test('customCommand wsl bash', (t) => {
  const sn = 'bash';
  const c = customCommand(q)([])(sn);

  t.throws(() => c([]), { message: emptyElementNotAllowedMessage });
  t.throws(() => c([``]), { message: emptyElementNotAllowedMessage });
  t.throws(() => c([q(``)]), { message: emptyElementNotAllowedMessage });

  t.deepEqual(c([q(`foo`), q(``)]), [sn, [`-c`, `'foo '\\'\\'`]]);
  t.deepEqual(c([q(`foo`)]), [sn, [`-c`, `foo`]]);
  t.deepEqual(c([q(`foo bar`)]), [sn, [`-c`, `\\''foo bar'\\'`]]);
  t.deepEqual(c([q(`'foo bar`)]), [sn, [`-c`, `'\\'\\'\\''foo bar'\\'`]]);
  t.deepEqual(c([q(`'`)]), [sn, [`-c`, `'\\'\\'`]]);
  t.deepEqual(c([q(`' `)]), [sn, [`-c`, `'\\'\\'\\'' '\\'`]]);
  t.deepEqual(c([q(`' foo`)]), [sn, [`-c`, `'\\'\\'\\'' foo'\\'`]]);
  t.deepEqual(c([q(`"' foo`)]), [sn, [`-c`, `\\''"'\\''\\'\\'\\'' foo'\\'`]]);
  t.deepEqual(c([q(`"'foo`)]), [sn, [`-c`, `\\''"'\\''\\'\\'\\''foo'\\'`]]);

  t.deepEqual(c([q(`\`expr 1 + 2\``), `\`expr 1 + 2\``]), [
    sn,
    [`-c`, `\\''\`expr 1 + 2\`'\\'' \`expr 1 + 2\`'`],
  ]);

  t.deepEqual(
    c([
      q(`foo`),
      q(``),
      q(`bar baz`),
      q(`"qux\\"quux"`),
      q(`%OS%`),
      q(`$env:OS`),
      q(`$\{env:OS}`),
      q(`$SHELL`),
      q(`$\{SHELL}`),
      q(`&()[]{}=;!'+,\`~|<>:\\`),
      q(`&()[]{}^=;!'+,\`~|<>TAB\tSP  \\":`),
    ]),
    [
      sn,
      [
        `-c`,
        `'foo '\\'\\'' '\\''bar baz'\\'' '\\''"qux\\"quux"'\\'' '\\''%OS%'\\'' '\\''$env:OS'\\'' '\\''$\{env:OS}'\\'' '\\''$SHELL'\\'' '\\''$\{SHELL}'\\'' '\\''&()[]{}=;!'\\''\\'\\'\\''+,\`~|<>:\\'\\'' '\\''&()[]{}^=;!'\\''\\'\\'\\''+,\`~|<>TAB\tSP  \\":'\\'`,
      ],
    ]
  );
});

test(`wCommand bash`, (t) => {
  const sn = 'bash';
  const c = wShellCommand(sn);

  t.throws(() => c([]), { message: emptyElementNotAllowedMessage });
  t.throws(() => c([``]), { message: emptyElementNotAllowedMessage });
  t.throws(() => c([q(``)]), { message: emptyElementNotAllowedMessage });

  t.deepEqual(c([q(`foo`), q(``)]), [sn, [`-c`, `"foo ''"`]]);
  t.deepEqual(c([q(`foo bar`)]), [sn, [`-c`, `"'foo bar'"`]]);
  t.deepEqual(c([q(`'foo bar`)]), [sn, [`-c`, `"\\''foo bar'"`]]);
  t.deepEqual(c([q(`'`)]), [sn, [`-c`, `\\'`]]);
  t.deepEqual(c([q(`' `)]), [sn, [`-c`, `"\\'' '"`]]);
  t.deepEqual(c([q(`' foo`)]), [sn, [`-c`, `"\\'' foo'"`]]);
  t.deepEqual(c([q(`"' foo`)]), [sn, [`-c`, `"'\\"'\\'' foo'"`]]);
  t.deepEqual(c([q(`"'foo`)]), [sn, [`-c`, `"'\\"'\\''foo'"`]]);

  t.deepEqual(c([q(`\`expr 1 + 2\``), `\`expr 1 + 2\``]), [
    sn,
    [`-c`, `"'\`expr 1 + 2\`' \`expr 1 + 2\`"`],
  ]);

  t.deepEqual(
    c([
      q(`foo`),
      q(``),
      q(`bar baz`),
      q(`"qux\\"quux"`),
      q(`%OS%`),
      q(`$env:OS`),
      q(`$\{env:OS}`),
      q(`$SHELL`),
      q(`$\{SHELL}`),
      q(`&()[]{}=;!'+,\`~|<>:\\`),
      q(`&()[]{}^=;!'+,\`~|<>TAB\tSP  \\":`),
    ]),
    [
      sn,
      [
        `-c`,
        `"foo '' 'bar baz' '\\"qux\\\\\\"quux\\"' '%OS%' '$env:OS' '$\{env:OS}' '$SHELL' '$\{SHELL}' '&()[]{}=;!'\\''+,\`~|<>:\\' '&()[]{}^=;!'\\''+,\`~|<>TAB\tSP  \\\\\\":'"`,
      ],
    ]
  );
});

function testCommand(tag: string, c: (args: readonly string[]) => Command) {
  const [sn] = c([`man`]);

  test(`command ${tag} ${sn}`, (t) => {
    t.throws(() => c([]), { message: emptyElementNotAllowedMessage });
    t.throws(() => c([``]), { message: emptyElementNotAllowedMessage });
    t.throws(() => c([q(``)]), { message: emptyElementNotAllowedMessage });

    t.deepEqual(c([q(`foo`), q(``)]), [sn, [`-c`, `foo ''`]]);
    t.deepEqual(c([q(`foo`)]), [sn, [`-c`, `foo`]]);
    t.deepEqual(c([q(`foo bar`)]), [sn, [`-c`, `'foo bar'`]]);
    t.deepEqual(c([q(`'foo bar`)]), [sn, [`-c`, `\\''foo bar'`]]);
    t.deepEqual(c([q(`'`)]), [sn, [`-c`, `\\'`]]);
    t.deepEqual(c([q(`' `)]), [sn, [`-c`, `\\'' '`]]);
    t.deepEqual(c([q(`' foo`)]), [sn, [`-c`, `\\'' foo'`]]);
    t.deepEqual(c([q(`"' foo`)]), [sn, [`-c`, `'"'\\'' foo'`]]);
    t.deepEqual(c([q(`"'foo`)]), [sn, [`-c`, `'"'\\''foo'`]]);

    t.deepEqual(c([q(`\`expr 1 + 2\``), `\`expr 1 + 2\``]), [
      sn,
      [`-c`, `'\`expr 1 + 2\`' \`expr 1 + 2\``],
    ]);

    t.deepEqual(
      c([
        q(`foo`),
        q(``),
        q(`bar baz`),
        q(`"qux\\"quux"`),
        q(`%OS%`),
        q(`$env:OS`),
        q(`$\{env:OS}`),
        q(`$SHELL`),
        q(`$\{SHELL}`),
        q(`&()[]{}=;!'+,\`~|<>:\\`),
        q(`&()[]{}^=;!'+,\`~|<>TAB\tSP  \\":`),
      ]),
      [
        sn,
        [
          `-c`,
          `foo '' 'bar baz' '"qux\\"quux"' '%OS%' '$env:OS' '$\{env:OS}' '$SHELL' '$\{SHELL}' '&()[]{}=;!'\\''+,\`~|<>:\\' '&()[]{}^=;!'\\''+,\`~|<>TAB\tSP  \\":'`,
        ],
      ]
    );
  });
}

testCommand(`pShellCommand`, pShellCommand(`dash`));
testCommand(`default`, command);
