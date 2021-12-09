/*! SPDX-License-Identifier: MIT */

import test from 'ava';

import { platform } from 'os';

import { quote as q } from '../lib/warg.js';

import { nodeBin, showArgsFile, spawnCommand } from './helper.js';

const isWin = platform() === 'win32';

const spawnOpts = {
  windowsVerbatimArguments: true,
};

function testSpawn() {
  const title = `spawn @${platform()}`;
  const sc = spawnCommand(spawnOpts);
  const sa = (args: readonly string[]) =>
    sc([q(nodeBin), [q(showArgsFile), ...args]]);
  const tsa = test.serial;

  tsa(`${title} #1`, async (t) => {
    t.is(await sa([]), `__EMPTY__`);
  });

  tsa(`${title} #2`, async (t) => {
    t.is(await sa([q(``)]), `[]`);
  });

  tsa(`${title} #3`, async (t) => {
    t.is(await sa([q(``), q(``)]), `[, ]`);
  });

  tsa(`${title} #4`, async (t) => {
    t.is(
      await sa([
        q(`foo`),
        q(``),
        `bar`,
        q(`baz qux`),
        q(`quux\tcorge`),
        q(`\\gr\\"au"lt`),
        q(`gar\\ply\\`),
        q(`'wal'do'`),
      ]),
      `[foo, , bar, baz qux, quux\tcorge, \\gr\\"au"lt, gar\\ply\\, 'wal'do']`
    );
  });

  tsa(`${title} #5`, async (t) => {
    t.is(
      await sa([q(`&()[]{}^=;!'+,\`~|<>%OS%TAB\tSP  \\":`)]),
      `[&()[]{}^=;!'+,\`~|<>%OS%TAB\tSP  \\":]`
    );
  });

  tsa(`${title} #6`, async (t) => {
    t.is(await sa([q(`&()[]{}=;!'+,\`~|<>%OS%`)]), `[&()[]{}=;!'+,\`~|<>%OS%]`);
  });
}

if (isWin) {
  testSpawn();
} else {
  test.skip(`spawn @${platform()}`, () => void 0);
}
