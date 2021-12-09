/*! SPDX-License-Identifier: MIT */

import test from 'ava';

import { concat, empty } from '../lib/xarg.js';

test('concat', (t) => {
  t.is(empty, '');
  t.is(concat(empty, empty), '');
  t.is(concat('foo', empty), 'foo');
  t.is(concat(empty, 'foo'), 'foo');
  t.is(concat('foo', 'bar'), 'foo bar');
  t.is(concat(concat('foo', 'bar'), 'baz'), 'foo bar baz');
  t.is(concat('foo', concat('bar', 'baz')), 'foo bar baz');
  t.is(concat(concat(empty, 'foo'), empty), 'foo');
  t.is(concat(empty, concat('foo', empty)), 'foo');
  t.is(concat(concat('foo', empty), 'bar'), 'foo bar');
  t.is(concat('foo', concat(empty, 'bar')), 'foo bar');
});
