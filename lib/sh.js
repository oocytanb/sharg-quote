/*! SPDX-License-Identifier: MIT */
import { identity, constant } from './fun.js';
import { concat, empty } from './xarg.js';
import { emptyElementNotAllowedMessage, validateNotEmpty, } from './xcommand.js';
import { quote as wargQuote } from './warg.js';
/**
 * @internal
 */
export function customQuote(pred) {
    return (a) => a.length === 0
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
export function customCommand(f) {
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
//# sourceMappingURL=sh.js.map