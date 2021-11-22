/*! SPDX-License-Identifier: MIT */

export function concat(a: string, b: string): string {
  return a && b ? `${a} ${b}` : a || b;
}

export const empty = '';
