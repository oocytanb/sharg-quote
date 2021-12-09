/*! SPDX-License-Identifier: MIT */

import * as os from 'os';

import { identity } from './fun.js';

export type Command = [string, string[]];

export const emptyElementNotAllowedMessage = 'Empty element not allowed.';

export function validateNotEmpty(a: string): string {
  if (!a) {
    throw new Error(emptyElementNotAllowedMessage);
  }
  return a;
}

export function executable(
  platform: ReturnType<typeof os.platform>
): (a: string) => string {
  const f =
    platform === 'win32'
      ? (a: string) => (/\.exe$/i.test(a) ? a : `${a}.exe`)
      : identity;
  return (a) => f(validateNotEmpty(a));
}
