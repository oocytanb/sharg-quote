/*! SPDX-License-Identifier: MIT */
import { Command } from './xcommand.mjs';
/**
 * @internal
 */
export declare function customQuote(pred: (a: string) => boolean): (a: string) => string;
/**
 * Quotes a string for using in the POSIX shell.
 */
export declare const quote: (a: string) => string;
/**
 * @internal
 */
export declare const shell = "sh";
/**
 * @internal
 */
export declare function customCommand(f: (a: string) => string): (shellOptions: readonly string[]) => (shell: string) => (args: readonly string[]) => Command;
/**
 * @internal
 */
export declare const pShellCommand: (shell: string) => (args: readonly string[]) => Command;
/**
 * @internal
 */
export declare const wShellCommand: (shell: string) => (args: readonly string[]) => Command;
/**
 * Builds a command to be executed on the POSIX shell.
 *
 * @throws Will throw an error if the first element is empty.
 *
 * @see {@link quote}
 */
export declare const command: (args: readonly string[]) => Command;
