/*! SPDX-License-Identifier: MIT */
import { constant } from './fun.js';
function quoteImpl(a) {
    let str = '"';
    let i = a.length - 1;
    while (i >= 0) {
        while (a.endsWith('\\', i + 1)) {
            str = '\\\\' + str;
            --i;
        }
        if (i < 0) {
            break;
        }
        const qtPos = a.lastIndexOf('"', i);
        if (qtPos < i) {
            str = a.substring(qtPos + 1, i + 1) + str;
        }
        i = qtPos;
        if (i >= 0) {
            do {
                str = '\\"' + str;
                --i;
            } while (i >= 0 && a.endsWith('"', i + 1));
        }
    }
    return '"' + str;
}
/**
 * @internal
 */
export function customQuote(pred) {
    return (a) => a.length === 0 ? '""' : pred(a) || /[" \t]/.test(a) ? quoteImpl(a) : a;
}
/**
 * Quotes a string for Windows process.
 *
 * @see [CreateProcessW]{@link https://docs.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw}
 * @see [CommandLineToArgvW]{@link https://docs.microsoft.com/en-us/windows/win32/api/shellapi/nf-shellapi-commandlinetoargvw}
 * @see [child_process.spawn options.windowsVerbatimArguments]{@link https://nodejs.org/docs/latest-v16.x/api/child_process.html#child_processspawncommand-args-options}
 */
export const quote = customQuote(constant(false));
//# sourceMappingURL=warg.js.map