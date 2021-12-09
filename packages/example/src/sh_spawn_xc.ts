/*! SPDX-License-Identifier: MIT */

import { spawn } from 'child_process';
import { sh } from 'sharg-quote';

function run() {
  const { quote: q, command: c } = sh;

  const [cmd, args] = c([
    q(`echo`),
    q(`foo`),
    q(`bar " ' baz`),
    '`expr 1 + 2`',
  ]);

  return spawn(cmd, args, {
    windowsVerbatimArguments: true,
  });
}

export { run };
