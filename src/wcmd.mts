/*! SPDX-License-Identifier: MIT */

import { constant } from './fun.mjs';
import { concat, empty } from './xarg.mjs';
import {
  Command,
  emptyElementNotAllowedMessage,
  validateNotEmpty,
} from './xcommand.mjs';
import { customQuote as wargCustomQuote } from './warg.mjs';

/**
 * Escapes a string by replacing certain characters to caret "^" escape sequence.
 */
export function escape(a: string): string {
  return a.replace(/["%|<>&()[\]{}^=;!'+,`~]/g, '^$&');
}

const wargQuote = wargCustomQuote(constant(true));

/**
 * @internal
 */
export function customQuote(
  pred: (a: string) => boolean
): (a: string) => string {
  return (a) => {
    if (a.length === 0) {
      return '""';
    } else {
      const b = a.replace(/\n/g, ' ');
      const c =
        pred(b) || /[" \t|<>&()[\]{}^=;!'+,`~]/.test(b) ? wargQuote(b) : b;
      return /["%]/.test(b) ? escape(c) : c;
    }
  };
}

/**
 * Quotes a string for using in cmd.exe.
 *
 * LF "\n" is replaced by SPACE " " since cmd.exe truncates it.
 * Also note that CR "\r" is omitted in cmd.exe.
 *
 * @see [cmd.exe]{@link https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/cmd}
 * @see [CreateProcessW]{@link https://docs.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw}
 * @see [CommandLineToArgvW]{@link https://docs.microsoft.com/en-us/windows/win32/api/shellapi/nf-shellapi-commandlinetoargvw}
 */
export const quote = customQuote(constant(false));

/**
 * @internal
 */
export const shell = 'cmd.exe';

/**
 * @internal
 */
export function customCommand(
  shellOptions: readonly string[]
): (shell: string) => (args: readonly string[]) => Command {
  const o = [...shellOptions, '/d', '/s', '/c'];
  return (shell) => {
    const sn = validateNotEmpty(shell);
    return (args) => {
      const hd = args[0];
      if (!hd || hd === '""') {
        throw new Error(emptyElementNotAllowedMessage);
      }

      return [sn, [...o, `"${args.reduce(concat, empty)}"`]];
    };
  };
}

/**
 * Builds a command to be executed on cmd.exe.
 *
 * @throws Will throw an error if the first element is empty.
 *
 * @see {@link quote}
 * @see {@link escape}
 * @see [cmd.exe]{@link https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/cmd}
 * @see [CreateProcessW]{@link https://docs.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw}
 * @see [CommandLineToArgvW]{@link https://docs.microsoft.com/en-us/windows/win32/api/shellapi/nf-shellapi-commandlinetoargvw}
 * @see [child_process.spawn options.windowsVerbatimArguments]{@link https://nodejs.org/docs/latest-v16.x/api/child_process.html#child_processspawncommand-args-options}
 */
export const wCommand = customCommand([])(shell);
