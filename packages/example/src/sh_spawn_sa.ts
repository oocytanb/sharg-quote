/*! SPDX-License-Identifier: MIT */

import { spawn } from 'child_process';
import { sh } from 'sharg-quote';

function run() {
  const { quote: q, command: c } = sh;

  const [cmd, args] = c([
    q(`node`),
    q(`test/res/show_args.js`),
    q(`foo`),
    q(`bar " ' baz`),
  ]);

  return spawn(cmd, args, {
    windowsVerbatimArguments: true,
  });
}

export { run };
