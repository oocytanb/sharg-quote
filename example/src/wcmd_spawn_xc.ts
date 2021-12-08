/*! SPDX-License-Identifier: MIT */

import { spawn } from 'child_process';
import { wcmd } from 'sharg-quote';

function run() {
  const { escape: esc, quote: q, wCommand: c } = wcmd;

  const [cmd, args] = c([q(`echo`), esc(`foo`), esc(`bar " ' baz`), `%OS%`]);

  return spawn(cmd, args, {
    windowsVerbatimArguments: true,
  });
}

export { run };
