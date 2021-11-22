/*! SPDX-License-Identifier: MIT */

import test from 'ava';

import { constant } from '../lib/fun.mjs';

import { emptyElementNotAllowedMessage } from '../lib/xcommand.mjs';

import {
  escape as esc,
  customQuote,
  quote as q,
  shell,
  customCommand,
  wCommand as c,
} from '../lib/wcmd.mjs';

test(`escape`, (t) => {
  t.is(esc(``), ``);
  t.is(esc(` `), ` `);
  t.is(esc(`\t`), `\t`);
  t.is(esc(`%`), `^%`);
  t.is(esc(`foo`), `foo`);
  t.is(esc(`foo bar`), `foo bar`);
  t.is(
    esc(`&()[]{}^=;!'+,\`~|<>:\\`),
    `^&^(^)^[^]^{^}^^^=^;^!^'^+^,^\`^~^|^<^>:\\`
  );
  t.is(
    esc(`&()[]{}^=;!'+,\`~|<>%OS%TAB\tSP  \\":`),
    `^&^(^)^[^]^{^}^^^=^;^!^'^+^,^\`^~^|^<^>^%OS^%TAB\tSP  \\^":`
  );
});

test(`customQuote`, (t) => {
  const cq = customQuote(constant(true));
  t.is(cq(``), `""`);
  t.is(cq(` `), `" "`);
  t.is(cq(`\n`), `" "`);
  t.is(cq(`\r`), `"\r"`);
  t.is(cq(`\t`), `"\t"`);
  t.is(cq(`%`), `^"^%^"`);
  t.is(cq(`%OS%`), `^"^%OS^%^"`);
  t.is(cq(`foo`), `"foo"`);
  t.is(cq(`foo bar`), `"foo bar"`);
  t.is(cq(`&()`), `"&()"`);
});

test(`quote`, (t) => {
  t.is(q(``), `""`);
  t.is(q(` `), `" "`);
  t.is(q(`\n`), `" "`);
  t.is(q(`\r`), `\r`);
  t.is(q(`\t`), `"\t"`);
  t.is(q(`\b\f\v\u007F\u0008`), `\b\f\v\u007F\u0008`);
  t.is(q(`%`), `^%`);
  t.is(q(`%OS%`), `^%OS^%`);
  t.is(q(`&()[]{}^=;!'+,\`~|<>:\\`), `"&()[]{}^=;!'+,\`~|<>:\\\\"`);
  t.is(
    q(`&()[]{}^=;!'+,\`~|<>%OS%TAB\tSP  \\":`),
    `^"^&^(^)^[^]^{^}^^^=^;^!^'^+^,^\`^~^|^<^>^%OS^%TAB\tSP  \\\\\\^":^"`
  );
  t.is(q(`foo`), `foo`);
  t.is(q(`foo bar`), `"foo bar"`);
  t.is(q(`foo\\bar`), `foo\\bar`);
  t.is(q(`"foo bar`), `^"\\^"foo bar^"`);
  t.is(q(`"foo"bar"`), `^"\\^"foo\\^"bar\\^"^"`);
  t.is(q(`foo""bar`), `^"foo\\^"\\^"bar^"`);
  t.is(q(`foo"\\"bar`), `^"foo\\^"\\\\\\^"bar^"`);
  t.is(q(`\\\\"bar`), `^"\\\\\\\\\\^"bar^"`);
  t.is(q(`foo\\`), `foo\\`);
  t.is(q(`foo\\\\`), `foo\\\\`);
  t.is(q(`\\`), `\\`);
  t.is(q(`"\\"`), `^"\\^"\\\\\\^"^"`);
  t.is(q(`"foo\\\\bar\\\\ " \t`), `^"\\^"foo\\\\bar\\\\ \\^" \t^"`);
  t.is(
    q(`foo" ^ "bar"&\t%OS%"baz`),
    `^"foo\\^" ^^ \\^"bar\\^"^&\t^%OS^%\\^"baz^"`
  );
  t.is(
    q(`foo" "bar" "baz "qux "quux" corge" grault" garply wal"do`),
    `^"foo\\^" \\^"bar\\^" \\^"baz \\^"qux \\^"quux\\^" corge\\^" grault\\^" garply wal\\^"do^"`
  );
});

test(`shell`, (t) => {
  t.is(shell, `cmd.exe`);
});

test(`customCommand`, (t) => {
  t.throws(() => customCommand([`/e:off`, `/q`])(''), {
    message: emptyElementNotAllowedMessage,
  });

  const cc = customCommand([`/e:off`, `/q`])('w');
  t.deepEqual(cc([q(`foo`), q(`bar baz`)]), [
    'w',
    [`/e:off`, `/q`, `/d`, `/s`, `/c`, `"foo "bar baz""`],
  ]);
});

test('command', (t) => {
  t.throws(() => c([]), {
    message: emptyElementNotAllowedMessage,
  });

  t.throws(() => c([``]), {
    message: emptyElementNotAllowedMessage,
  });

  t.throws(() => c([q(``)]), {
    message: emptyElementNotAllowedMessage,
  });

  t.deepEqual(c([q(`foo`), ``, q(``)]), [
    shell,
    [`/d`, `/s`, `/c`, `"foo """`],
  ]);

  t.deepEqual(c([`foo`, q(`bar`)]), [shell, [`/d`, `/s`, `/c`, `"foo bar"`]]);

  t.deepEqual(
    c([
      q(`foo`),
      q(`bar baz`),
      q(`"qux\\"quux"`),
      q(`%OS%`),
      q(`&<>`),
      q(`"&<\\>\\`),
    ]),
    [
      shell,
      [
        `/d`,
        `/s`,
        `/c`,
        `"foo "bar baz" ^"\\^"qux\\\\\\^"quux\\^"^" ^%OS^% "&<>" ^"\\^"^&^<\\^>\\\\^""`,
      ],
    ]
  );

  (() => {
    const bc = c([
      q('foo'),
      q('bar baz'),
      q('"qux\\"quux"'),
      q('%OS%'),
      q('&<>'),
      q('"&<\\>\\'),
    ]);

    const nc = c([q(bc[0]), ...bc[1].map(esc)]);

    t.deepEqual(nc, [
      shell,
      [
        `/d`,
        `/s`,
        `/c`,
        `"cmd.exe /d /s /c ^"foo ^"bar baz^" ^^^"\\^^^"qux\\\\\\^^^"quux\\^^^"^^^" ^^^%OS^^^% ^"^&^<^>^" ^^^"\\^^^"^^^&^^^<\\^^^>\\\\^^^"^""`,
      ],
    ]);
  })();
});
