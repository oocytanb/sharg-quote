/*! SPDX-License-Identifier: MIT */

import test from 'ava';

import { constant } from '../lib/fun.mjs';
import { customQuote, quote as q } from '../lib/warg.mjs';

test('customQuote', (t) => {
  const cq = customQuote(constant(true));
  t.is(cq(``), `""`);
  t.is(cq(` `), `" "`);
  t.is(cq(`\t`), '"\t"');
  t.is(cq(`%`), `"%"`);
  t.is(cq(`foo`), `"foo"`);
  t.is(cq(`foo bar\\"\t%`), `"foo bar\\\\\\"\t%"`);
});

test('quote', (t) => {
  t.is(q(``), `""`);
  t.is(q(`foo`), `foo`);
  t.is(q(`foo `), `"foo "`);
  t.is(q(` foo`), `" foo"`);
  t.is(q(`  foo   `), `"  foo   "`);
  t.is(q(`foo bar`), `"foo bar"`);
  t.is(q(`foo\tbar`), `"foo\tbar"`);
  t.is(q(`foo"bar`), `"foo\\"bar"`);
  t.is(q(`foo\\bar`), `foo\\bar`);
  t.is(q(`"foo \t bar`), `"\\"foo \t bar"`);
  t.is(q(`"foo"bar"`), `"\\"foo\\"bar\\""`);
  t.is(q(`foo""bar`), `"foo\\"\\"bar"`);
  t.is(q(`foo"\\"bar`), `"foo\\"\\\\\\"bar"`);
  t.is(q(`\\\\"bar`), `"\\\\\\\\\\"bar"`);
  t.is(q(`foo\\`), `foo\\`);
  t.is(q(`foo\\\\`), `foo\\\\`);
  t.is(q(`\\`), `\\`);
  t.is(q(`"\\"`), `"\\"\\\\\\""`);
  t.is(q(`"foo\\\\bar\\\\"\t`), `"\\"foo\\\\bar\\\\\\\\\\"\t"`);
  t.is(
    q(`foo" "bar" "baz "qux "quux" corge" grault" garply wal"do`),
    `"foo\\" \\"bar\\" \\"baz \\"qux \\"quux\\" corge\\" grault\\" garply wal\\"do"`
  );
});
