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
      : pred(a) || /[`"'\s{}();,|&@<>$#[\]%]/.test(a)
      ? `'${a.replace(/[']/g, "''")}'`
      : a;
}

/**
 * Quotes a string for using in pwsh.
 *
 * @see {@link wQuote}
 * @see [pwsh about_Quoting_Rules]{@link https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-7.2}
 * @see [pwsh about_Parsing]{@link https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing?view=powershell-7.2}
 */
export const quote = customQuote(constant(false));

/**
 * Quotes a string for using in pwsh.
 * Equivalent to `quote(warg.quote(a))`.
 *
 * @see {@link quote}
 * @see {@link warg}
 * @see [pwsh about_Quoting_Rules]{@link https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-7.2}
 * @see [pwsh about_Parsing]{@link https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing?view=powershell-7.2}
 */
export function wQuote(a: string): string {
  return quote(wargQuote(a));
}

/**
 * @internal
 */
export const shell = 'pwsh';

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

        return [
          sn,
          [...o, f([`&${hd}`, ...args.slice(1)].reduce(concat, empty))],
        ];
      };
    };
  };
}

/**
 * Builds a command to be executed on pwsh for POSIX.
 *
 * @throws Will throw an error if the first element is empty.
 *
 * @see {@link quote}
 * @see {@link wQuote}
 * @see [pwsh about_Quoting_Rules]{@link https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-7.2}
 * @see [pwsh about_Parsing]{@link https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing?view=powershell-7.2}
 * @see [child_process.spawn options.windowsVerbatimArguments]{@link https://nodejs.org/docs/latest-v16.x/api/child_process.html#child_processspawncommand-args-options}
 */
export const command = customCommand(identity)([])(shell);

/**
 * Builds a command to be executed on pwsh for Windows.
 *
 * @throws Will throw an error if the first element is empty.
 *
 * @see {@link quote}
 * @see {@link wQuote}
 * @see [pwsh about_Quoting_Rules]{@link https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-7.2}
 * @see [pwsh about_Parsing]{@link https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing?view=powershell-7.2}
 * @see [child_process.spawn options.windowsVerbatimArguments]{@link https://nodejs.org/docs/latest-v16.x/api/child_process.html#child_processspawncommand-args-options}
 */
export const wCommand = customCommand(wargQuote)([])(shell);
