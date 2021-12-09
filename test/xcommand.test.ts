/*! SPDX-License-Identifier: MIT */

import test from 'ava';

import {
  emptyElementNotAllowedMessage,
  validateNotEmpty,
  executable,
} from '../lib/xcommand.js';

test('validateNotEmpty', (t) => {
  t.throws(
    () => {
      validateNotEmpty('');
    },
    { message: emptyElementNotAllowedMessage }
  );
  t.is(validateNotEmpty('foo'), 'foo');
});

test('executable @linux', (t) => {
  const x = executable('linux');

  t.throws(
    () => {
      x('');
    },
    { message: emptyElementNotAllowedMessage }
  );

  t.is(x('foo'), 'foo');
  t.is(x('foo.exe'), 'foo.exe');
  t.is(x('foo.eXe'), 'foo.eXe');
});

test('executable @win32', (t) => {
  const x = executable('win32');

  t.throws(
    () => {
      x('');
    },
    { message: emptyElementNotAllowedMessage }
  );

  t.is(x('foo'), 'foo.exe');
  t.is(x('foo.exe'), 'foo.exe');
  t.is(x('foo.eXe'), 'foo.eXe');
});
