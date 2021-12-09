/*! SPDX-License-Identifier: MIT */

import { spawn } from 'child_process';
import { pwsh } from 'sharg-quote';

function run() {
  const { quote: q, wCommand: c } = pwsh;

  const [cmd, args] = c([q(`echo`), q(`foo`), q(`bar " ' baz`), `$(1+2)`]);

  return spawn(cmd, args, {
    windowsVerbatimArguments: true,
  });
}

export { run };
