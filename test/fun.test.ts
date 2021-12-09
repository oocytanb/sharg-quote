/*! SPDX-License-Identifier: MIT */

import test from 'ava';

import { identity, constant } from '../lib/fun.js';

test('identity', (t) => {
  t.is(identity(undefined), undefined);
  t.is(identity(null), null);
  t.is(identity(''), '');
  t.is(identity('foo'), 'foo');
  t.is(identity(0), 0);
  t.is(identity(123), 123);
  t.is(identity(false), false);
  t.is(identity(true), true);
  t.deepEqual(identity({}), {});
  t.deepEqual(identity({ foo: 123 }), { foo: 123 });
});

test('constant', (t) => {
  t.is(constant(undefined)(), undefined);
  t.is(constant(null)(), null);
  t.is(constant('')(), '');
  t.is(constant('foo')(), 'foo');
  t.is(constant(0)(), 0);
  t.is(constant(123)(), 123);
  t.is(constant(true)(), true);
  t.is(constant(false)(), false);
  t.deepEqual(constant({})(), {});
  t.deepEqual(constant({ foo: 123 })(), { foo: 123 });
});
