/*! SPDX-License-Identifier: MIT */

import { spawn } from 'child_process';
import { pwsh } from 'sharg-quote';

function run() {
  const { quote: q, wQuote: wq, wCommand: c } = pwsh;

  const [cmd, args] = c([
    q(`node`),
    wq(`test/res/show_args.js`),
    wq(`foo`),
    wq(`bar " ' baz`),
  ]);

  return spawn(cmd, args, {
    windowsVerbatimArguments: true,
  });
}

export { run };
