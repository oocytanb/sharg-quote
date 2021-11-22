/*! SPDX-License-Identifier: MIT */

import test from 'ava';

import { constant } from '../lib/fun.mjs';
import { emptyElementNotAllowedMessage } from '../lib/xcommand.mjs';

import {
  customQuote,
  quote as q,
  wQuote as wq,
  shell,
  customCommand,
  command,
  wCommand,
} from '../lib/pwsh.mjs';

test('customQuote', (t) => {
  const cq = customQuote(constant(true));
  t.is(cq(``), `''`);
  t.is(cq(` `), `' '`);
  t.is(cq(`\n`), `'\n'`);
  t.is(cq(`\r`), `'\r'`);
  t.is(cq(`\t`), `'\t'`);
  t.is(cq(`%`), `'%'`);
  t.is(cq(`"`), `'"'`);
  t.is(cq(`'`), `''''`);
  t.is(cq(`' `), `''' '`);
  t.is(cq(`"' foo`), `'"'' foo'`);
  t.is(cq(`foo`), `'foo'`);
  t.is(cq(`foo bar`), `'foo bar'`);
  t.is(cq(`"foo bar`), `'"foo bar'`);
});

test('quote', (t) => {
  t.is(q(``), `''`);
  t.is(q(` `), `' '`);
  t.is(q(`\n`), `'\n'`);
  t.is(q(`\r`), `'\r'`);
  t.is(q(`\t`), `'\t'`);
  t.is(q(`%`), `'%'`);
  t.is(q(`"`), `'"'`);
  t.is(q(`'`), `''''`);
  t.is(q(`' `), `''' '`);
  t.is(q(`"' foo`), `'"'' foo'`);
  t.is(q(`foo`), `foo`);
  t.is(q(`foo bar`), `'foo bar'`);
  t.is(q(`"foo bar`), `'"foo bar'`);
  t.is(q(`%OS%`), `'%OS%'`);
  t.is(q(`\${env:OS}`), `'\${env:OS}'`);
});

test('shell', (t) => {
  t.is(shell, 'pwsh');
});

test('customCommand', (t) => {
  const cc = customCommand((a) => a.toUpperCase())([`-ep`, `Bypass`]);
  t.throws(() => cc(``));

  const c = cc(`powershell`);
  t.throws(() => c([]), { message: emptyElementNotAllowedMessage });
  t.throws(() => c([``]), { message: emptyElementNotAllowedMessage });

  t.deepEqual(c([`foo`, wq(`bar BAZ`), `&&`, wq(`123 &`), `| p`]), [
    'powershell',
    [`-ep`, `Bypass`, `-c`, `&FOO '"BAR BAZ"' && '"123 &"' | P`],
  ]);
});

test('command', (t) => {
  const sn = shell;
  const c = command;
  t.throws(() => c([]), { message: emptyElementNotAllowedMessage });
  t.throws(() => c([``]), { message: emptyElementNotAllowedMessage });
  t.throws(() => c([`""`]), {
    message: emptyElementNotAllowedMessage,
  });
  t.throws(() => c([q(``)]), { message: emptyElementNotAllowedMessage });
  t.throws(() => c([q(``), wq(``)]), {
    message: emptyElementNotAllowedMessage,
  });

  t.deepEqual(c([q(`foo`), wq(``)]), [sn, [`-c`, `&foo '""'`]]);
  t.deepEqual(c([q(`foo`)]), [sn, [`-c`, `&foo`]]);
  t.deepEqual(c([q(`foo bar`)]), [sn, [`-c`, `&'foo bar'`]]);
  t.deepEqual(c([q(`"foo bar`)]), [sn, [`-c`, `&'"foo bar'`]]);
  t.deepEqual(c([q(`'`)]), [sn, [`-c`, `&''''`]]);
  t.deepEqual(c([q(`' `)]), [sn, [`-c`, `&''' '`]]);
  t.deepEqual(c([q(`' foo`)]), [sn, [`-c`, `&''' foo'`]]);
  t.deepEqual(c([q(`"' foo`)]), [sn, [`-c`, `&'"'' foo'`]]);
  t.deepEqual(c([q(`"'foo`)]), [sn, [`-c`, `&'"''foo'`]]);
  t.deepEqual(c([q(`foo`), wq(`bar`), wq(``), wq(`baz`)]), [
    sn,
    [`-c`, `&foo bar '""' baz`],
  ]);

  t.deepEqual(c([q(`$(1 + 2)`), `$(1 + 2)`]), [
    sn,
    [`-c`, `&'$(1 + 2)' $(1 + 2)`],
  ]);

  t.deepEqual(
    c([
      q(`foo`),
      wq(``),
      wq(`bar baz`),
      wq(`"qux\\"quux"`),
      wq(`%OS%`),
      wq(`$env:OS`),
      wq(`$\{env:OS}`),
      wq(`$SHELL`),
      wq(`$\{SHELL}`),
      wq(`&()[]{}=;!'+,\`~|<>:\\`),
      wq(`&()[]{}^=;!'+,\`~|<>TAB\tSP  \\":`),
    ]),
    [
      sn,
      [
        `-c`,
        `&foo '""' '"bar baz"' '"\\"qux\\\\\\"quux\\""' '%OS%' '$env:OS' '$\{env:OS}' '$SHELL' '$\{SHELL}' '&()[]{}=;!''+,\`~|<>:\\' '"&()[]{}^=;!''+,\`~|<>TAB\tSP  \\\\\\":"'`,
      ],
    ]
  );
});

test('wCommand', (t) => {
  const sn = shell;
  const c = wCommand;
  t.throws(() => c([]), { message: emptyElementNotAllowedMessage });
  t.throws(() => c([``]), { message: emptyElementNotAllowedMessage });
  t.throws(() => c([`""`]), {
    message: emptyElementNotAllowedMessage,
  });
  t.throws(() => c([q(``)]), { message: emptyElementNotAllowedMessage });
  t.throws(() => c([q(``), wq(``)]), {
    message: emptyElementNotAllowedMessage,
  });

  t.deepEqual(c([q(`foo`), wq(``)]), [sn, [`-c`, `"&foo '\\"\\"'"`]]);
  t.deepEqual(c([`foo`]), [sn, [`-c`, `&foo`]]);
  t.deepEqual(c([q(`foo bar`)]), [sn, [`-c`, `"&'foo bar'"`]]);
  t.deepEqual(c([q(`"foo bar`)]), [sn, [`-c`, `"&'\\"foo bar'"`]]);
  t.deepEqual(c([q(`'`)]), [sn, [`-c`, `&''''`]]);
  t.deepEqual(c([q(`' `)]), [sn, [`-c`, `"&''' '"`]]);
  t.deepEqual(c([q(`' foo`)]), [sn, [`-c`, `"&''' foo'"`]]);
  t.deepEqual(c([q(`"' foo`)]), [sn, [`-c`, `"&'\\"'' foo'"`]]);
  t.deepEqual(c([q(`"'foo`)]), [sn, [`-c`, `"&'\\"''foo'"`]]);
  t.deepEqual(c([q(`foo`), wq(`bar`), wq(``), wq(`baz`)]), [
    sn,
    [`-c`, `"&foo bar '\\"\\"' baz"`],
  ]);

  t.deepEqual(c([q(`$(1 + 2)`), `$(1 + 2)`]), [
    sn,
    [`-c`, `"&'$(1 + 2)' $(1 + 2)"`],
  ]);

  t.deepEqual(
    c([
      q(`foo`),
      wq(``),
      wq(`bar baz`),
      wq(`"qux\\"quux"`),
      wq(`%OS%`),
      wq(`$env:OS`),
      wq(`$\{env:OS}`),
      wq(`$SHELL`),
      wq(`$\{SHELL}`),
      wq(`&()[]{}=;!'+,\`~|<>:\\`),
      wq(`&()[]{}^=;!'+,\`~|<>TAB\tSP  \\":`),
    ]),
    [
      sn,
      [
        `-c`,
        `"&foo '\\"\\"' '\\"bar baz\\"' '\\"\\\\\\"qux\\\\\\\\\\\\\\"quux\\\\\\"\\"' '%OS%' '$env:OS' '$\{env:OS}' '$SHELL' '$\{SHELL}' '&()[]{}=;!''+,\`~|<>:\\' '\\"&()[]{}^=;!''+,\`~|<>TAB\tSP  \\\\\\\\\\\\\\":\\"'"`,
      ],
    ]
  );
});
