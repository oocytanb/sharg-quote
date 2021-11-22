/*! SPDX-License-Identifier: MIT */
import { Command } from './xcommand.mjs';
/**
 * @internal
 */
export declare function customQuote(pred: (a: string) => boolean): (a: string) => string;
/**
 * Quotes a string for using in pwsh.
 *
 * @see {@link wQuote}
 * @see [pwsh about_Quoting_Rules]{@link https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-7.2}
 * @see [pwsh about_Parsing]{@link https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing?view=powershell-7.2}
 */
export declare const quote: (a: string) => string;
/**
 * Quotes a string for using in pwsh.
 * Equivalent to `quote(warg.quote(a))`.
 *
 * @see {@link quote}
 * @see {@link warg}
 * @see [pwsh about_Quoting_Rules]{@link https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-7.2}
 * @see [pwsh about_Parsing]{@link https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing?view=powershell-7.2}
 */
export declare function wQuote(a: string): string;
/**
 * @internal
 */
export declare const shell = "pwsh";
/**
 * @internal
 */
export declare function customCommand(f: (a: string) => string): (shellOptions: readonly string[]) => (shell: string) => (args: readonly string[]) => Command;
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
export declare const command: (args: readonly string[]) => Command;
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
export declare const wCommand: (args: readonly string[]) => Command;
