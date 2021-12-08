/*! SPDX-License-Identifier: MIT */

import { Buffer } from 'buffer';
import { ChildProcess } from 'child_process';

import { concat, empty } from 'sharg-quote/lib/xarg';
import { xcommand } from 'sharg-quote/lib';

export const { emptyElementNotAllowedMessage, validateNotEmpty } = xcommand;

function fmr<A>(f: (a: A) => string): (prev: string, curr: A) => string {
  return (prev, curr) => concat(prev, f(curr));
}

export function foldMap<A>(
  f: (a: A) => string
): (args: readonly A[]) => string {
  const m = fmr(f);
  return (args) => args.reduce(m, empty);
}

export function asyncChildProcess(p: ChildProcess) {
  let rejected = false;
  let outBuffer = Buffer.alloc(0);

  return new Promise<Buffer>((resolve, reject) => {
    p.stdout?.on('data', (chunk) => {
      outBuffer = Buffer.concat([outBuffer, chunk]);
    });

    p.on('error', (err) => {
      rejected = true;
      reject(err);
    });

    p.on('exit', (code) => {
      if (!rejected) {
        const exitCode = code ?? 0;
        if (code === 0) {
          resolve(outBuffer);
        } else {
          rejected = true;
          reject(new Error(`Exit code: ${exitCode}`));
        }
      }
    });
  });
}
