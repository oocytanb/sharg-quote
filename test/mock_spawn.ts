/*! SPDX-License-Identifier: MIT */

import { ImplementationFn, ExecutionContext } from 'ava';

import { platform } from 'os';
import { join } from 'path';
import { Buffer } from 'buffer';
import { TextDecoder } from 'util';
import { spawn } from 'child_process';

import { executable } from '../lib/xcommand.mjs';

export type SpawnResult = Readonly<{
  exitCode: number;
  stdout: string;
  stderr: string;
}>;

export type SpawnOptions = Readonly<{
  windowsVerbatimArguments?: boolean;
  encoding?: string;
  maxBuffer?: number;
}>;

export const nodeBin = executable(platform())('node');

export const showArgsFile = 'test/res/show_args.mjs';

export const testResDir = join('test', 'res');

export const testDataDir = join(testResDir, 'data');

function trimEOL(s: string): string {
  const len = s.length;
  return s.endsWith('\n')
    ? s.endsWith('\r', len - 1)
      ? s.substring(0, len - 2)
      : s.substring(0, len - 1)
    : s;
}

function chunkOutput(
  out: (s: string) => void,
  decoder: TextDecoder
): (chunk: unknown) => void {
  return (chunk) => {
    if (chunk != null) {
      const text =
        chunk instanceof Buffer
          ? decoder.decode(chunk)
          : typeof chunk === 'string'
          ? chunk
          : `${chunk}`;

      out(text);
    }
  };
}

export function asyncSpawn(
  command: string,
  args: readonly string[],
  opt?: SpawnOptions
): Promise<SpawnResult> {
  const maxBufferSize = Math.max(1, opt?.maxBuffer ?? 1024 * 1024);

  function limConcatRec(a: string, b: string) {
    const aLen = a.length;
    const bLen = b.length;
    const tLen = aLen + bLen - maxBufferSize;
    return tLen <= 0 ? a + b : tLen >= bLen ? a : b.substring(0, bLen - tLen);
  }

  return new Promise<SpawnResult>((resolve, reject) => {
    const decoder = new TextDecoder(opt?.encoding ?? 'utf-8');

    let rejected = false;
    let stdoutRec = '';
    let stderrRec = '';

    const p = spawn(command, args, {
      windowsVerbatimArguments: opt?.windowsVerbatimArguments,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    p.stdout?.on(
      'data',
      chunkOutput((s) => {
        stdoutRec = limConcatRec(stdoutRec, s);
      }, decoder)
    );

    p.stderr?.on(
      'data',
      chunkOutput((s) => {
        stderrRec = limConcatRec(stderrRec, s);
      }, decoder)
    );

    p.on('error', (err) => {
      rejected = true;
      reject(err);
    });

    p.on('exit', (code) => {
      if (!rejected) {
        const exitCode = code ?? 0;
        if (code === 0) {
          resolve({
            exitCode,
            stdout: trimEOL(stdoutRec),
            stderr: trimEOL(stderrRec),
          });
        } else {
          rejected = true;
          reject(new Error(stderrRec));
        }
      }
    });
  });
}

export function spawnCommand(
  opt?: SpawnOptions
): (c: readonly [cmd: string, args: readonly string[]]) => Promise<string> {
  return async ([cmd, args]) => (await asyncSpawn(cmd, args, opt)).stdout;
}

export function makeConditionalTest<Context>(
  tf: (title: string, impl: ImplementationFn<unknown[], Context>) => void,
  pred: (ctx: Context) => boolean
): (title: string, impl: ImplementationFn<unknown[], Context>) => void {
  return (title, impl) => {
    tf(title, (t: ExecutionContext<Context>) =>
      pred(t.context) ? impl(t) : t.log('[SKIP]')
    );
  };
}
