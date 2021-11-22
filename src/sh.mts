/*! SPDX-License-Identifier: MIT */

import { identity, constant } from './fun.mjs';
import { concat, empty } from './xarg.mjs';

import {
  Command,
  emptyElementNotAllowedMessage,
  validateNotEmpty,
} from './xcommand.mjs';

import { quote as wargQuote } from './warg.mjs';

/**
 * @internal
 */
export function customQuote(
  pred: (a: string) => boolean
): (a: string) => string {
  return (a) =>
    a.length === 0
      ? "''"
      : pred(a) || /["' \t\n\r|&;<>()$`\\*?[\]#~=%]/.test(a)
      ? `'${a.replace(/'/g, "'\\''")}'`
          .replace(/'''/g, "'")
          .replace(/^''([\s\S])/, '$1')
      : a;
}

/**
 * Quotes a string for using in the POSIX shell.
 */
export const quote = customQuote(constant(false));

/**
 * @internal
 */
export const shell = 'sh';

/**
 * @internal
 */
export function customCommand(
  f: (a: string) => string
): (
  shellOptions: readonly string[]
) => (shell: string) => (args: readonly string[]) => Command {
  return (shellOptions) => {
    const o = [...shellOptions, '-c'];
    return (shell) => {
      const sn = validateNotEmpty(shell);
      return (args) => {
        const hd = args[0];
        if (!hd || hd === "''" || hd === '""') {
          throw new Error(emptyElementNotAllowedMessage);
        }

        return [sn, [...o, f(args.reduce(concat, empty))]];
      };
    };
  };
}

/**
 * @internal
 */
export const pShellCommand = customCommand(identity)([]);

/**
 * @internal
 */
export const wShellCommand = customCommand(wargQuote)([]);

/**
 * Builds a command to be executed on the POSIX shell.
 *
 * @throws Will throw an error if the first element is empty.
 *
 * @see {@link quote}
 */
export const command = pShellCommand(shell);
