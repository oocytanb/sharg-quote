/*! SPDX-License-Identifier: MIT */
import * as os from 'os';
export declare type Command = [string, string[]];
export declare const emptyElementNotAllowedMessage = "Empty element not allowed.";
export declare function validateNotEmpty(a: string): string;
export declare function executable(platform: ReturnType<typeof os.platform>): (a: string) => string;
