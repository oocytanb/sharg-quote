/*! SPDX-License-Identifier: MIT */

import { spawn } from 'child_process';
import { wcmd } from 'sharg-quote';

function run() {
  const { quote: q, wCommand: c } = wcmd;

  const [cmd, args] = c([
    q(`node`),
    q(`test/res/show_args.mjs`),
    q(`foo`),
    q(`bar " ' baz`),
  ]);

  return spawn(cmd, args, {
    windowsVerbatimArguments: true,
  });
}

export { run };
