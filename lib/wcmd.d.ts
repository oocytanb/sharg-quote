/*! SPDX-License-Identifier: MIT */
import { Command } from './xcommand.mjs';
/**
 * Escapes a string by replacing certain characters to caret "^" escape sequence.
 */
export declare function escape(a: string): string;
/**
 * @internal
 */
export declare function customQuote(pred: (a: string) => boolean): (a: string) => string;
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
export declare const quote: (a: string) => string;
/**
 * @internal
 */
export declare const shell = "cmd.exe";
/**
 * @internal
 */
export declare function customCommand(shellOptions: readonly string[]): (shell: string) => (args: readonly string[]) => Command;
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
export declare const wCommand: (args: readonly string[]) => Command;
