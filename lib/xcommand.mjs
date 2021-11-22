/*! SPDX-License-Identifier: MIT */
import { identity } from './fun.mjs';
export const emptyElementNotAllowedMessage = 'Empty element not allowed.';
export function validateNotEmpty(a) {
    if (!a) {
        throw new Error(emptyElementNotAllowedMessage);
    }
    return a;
}
export function executable(platform) {
    const f = platform === 'win32'
        ? (a) => (/\.exe$/i.test(a) ? a : `${a}.exe`)
        : identity;
    return (a) => f(validateNotEmpty(a));
}
//# sourceMappingURL=xcommand.mjs.map