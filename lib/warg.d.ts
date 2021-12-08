/*! SPDX-License-Identifier: MIT */
/**
 * @internal
 */
export declare function customQuote(pred: (a: string) => boolean): (a: string) => string;
/**
 * Quotes a string for Windows process.
 *
 * @see [CreateProcessW]{@link https://docs.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw}
 * @see [CommandLineToArgvW]{@link https://docs.microsoft.com/en-us/windows/win32/api/shellapi/nf-shellapi-commandlinetoargvw}
 * @see [child_process.spawn options.windowsVerbatimArguments]{@link https://nodejs.org/docs/latest-v16.x/api/child_process.html#child_processspawncommand-args-options}
 */
export declare const quote: (a: string) => string;
