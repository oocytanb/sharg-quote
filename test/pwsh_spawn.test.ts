/*! SPDX-License-Identifier: MIT */

import testFn, { TestFn } from 'ava';

import { platform } from 'os';
import { basename, join } from 'path';

import semver from 'semver';

import { identity, constant } from '../lib/fun.js';
import { Command } from '../lib/xcommand.js';
import { quote as wargQuote } from '../lib/warg.js';

import {
  quote as q,
  wQuote as wq,
  shell,
  customCommand,
  command,
  wCommand,
} from '../lib/pwsh.js';

import {
  nodeBin,
  showArgsFile,
  testResDir,
  testDataDir,
  asyncSpawn,
  spawnCommand,
  makeConditionalTest,
} from './helper.js';

type CommandBuilder = (args: readonly string[]) => Command;

type TestContext = {
  probeSet?: Record<string, boolean>;
};

const test = testFn as TestFn<TestContext>;

const isWin = platform() === 'win32';

const spawnOpts = {
  windowsVerbatimArguments: true,
};

function contextPred(sn: string): (ctx: TestContext) => boolean {
  return (ctx) => !!ctx?.probeSet?.[sn];
}

function contextPredNps(sn: string): (ctx: TestContext) => boolean {
  return basename(sn).toLowerCase().startsWith(`powershell`)
    ? constant(false)
    : contextPred(sn);
}

function testBefore(c: CommandBuilder) {
  const [sn, echoArgs] = c([`echo`, `foo`]);

  test.serial.before(`probe spawn ${sn} @${platform()}`, async (t) => {
    try {
      await asyncSpawn(sn, echoArgs, spawnOpts);
      t.context.probeSet = { ...t.context.probeSet, [sn]: true };
    } catch (err) {
      t.log(`Could not execute "${sn}": ${err}`);
    }
  });
}

function testSpawn(c: CommandBuilder, bc: CommandBuilder) {
  const [sn] = c([`man`]);
  const title = `spawn ${sn} @${platform()}`;
  const sc = spawnCommand(spawnOpts);
  const sa = (args: readonly string[]) =>
    sc(c([wq(nodeBin), wq(showArgsFile), ...args]));
  const tsa = makeConditionalTest(test, contextPred(sn));
  const tsaNps = makeConditionalTest(test, contextPredNps(sn));

  tsa(`${title} #1`, async (t) => {
    t.is(await sa([]), `__EMPTY__`);
  });

  tsa(`${title} #2`, async (t) => {
    t.is(await sa([wq(``)]), `[]`);
  });

  tsa(`${title} #3`, async (t) => {
    t.is(await sa([wq(``), wq(``)]), `[, ]`);
  });

  tsaNps(`${title} #4`, async (t) => {
    t.is(await sa([wq(`"foo bar`)]), `["foo bar]`);
  });

  tsa(`${title} #5`, async (t) => {
    t.is(await sa([wq(`'`)]), `[']`);
  });

  tsa(`${title} #6`, async (t) => {
    t.is(await sa([wq(`' `)]), `[' ]`);
  });

  tsa(`${title} #7`, async (t) => {
    t.is(await sa([wq(`' foo`)]), `[' foo]`);
  });

  tsaNps(`${title} #8`, async (t) => {
    t.is(await sa([wq(`"' foo`)]), `["' foo]`);
  });

  tsa(`${title} #9`, async (t) => {
    t.is(await sa([wq(`"'foo`)]), `["'foo]`);
  });

  tsa(`${title} #10`, async (t) => {
    t.is(await sa([wq(`\${env:OS}`)]), `[\${env:OS}]`);
  });

  tsa(`${title} #11`, async (t) => {
    t.is(
      await sa([
        wq(`foo`),
        wq(``),
        `bar`,
        wq(`baz qux`),
        wq(`quux\tcorge`),
        wq(`\\gr\\"au"lt`),
        wq(`gar\\ply\\`),
        wq(`'wal'do'`),
      ]),
      `[foo, , bar, baz qux, quux\tcorge, \\gr\\"au"lt, gar\\ply\\, 'wal'do']`
    );
  });

  tsa(`${title} #12`, async (t) => {
    t.is(
      await sa([
        wq(``),
        wq(`foo`),
        `bar`,
        wq(`baz qux`),
        wq(`quux\tcorge`),
        wq(`\\gr\\"au"lt`),
        wq(`gar\\ply\\`),
        wq(`'wal'do'`),
      ]),
      `[, foo, bar, baz qux, quux\tcorge, \\gr\\"au"lt, gar\\ply\\, 'wal'do']`
    );
  });

  tsa(`${title} #13`, async (t) => {
    t.is(
      await sa([wq(`&()[]{}^=;!'+,\`~|<>%OS%TAB\tSP  \\":`)]),
      `[&()[]{}^=;!'+,\`~|<>%OS%TAB\tSP  \\":]`
    );
  });

  tsa(`${title} #14`, async (t) => {
    t.is(
      await sa([wq(`\`"'{}();,|&@$<>[]+.:!*/%=#-\\`)]),
      `[\`"'{}();,|&@$<>[]+.:!*/%=#-\\]`
    );
  });

  tsaNps(`${title} #15`, async (t) => {
    t.is(
      await sa([wq(`\`"' {}();,|&@$<>[]+.:!*/%=#-\\`)]),
      `[\`"' {}();,|&@$<>[]+.:!*/%=#-\\]`
    );
  });

  tsa(`${title} #16`, async (t) => {
    t.is(
      await sa([
        wq(`foo`),
        wq(`bar baz`),
        wq(`"qux\\"quux"`),
        wq(`%OS%`),
        wq(`&<>`),
        wq(`"&<\\>\\`),
      ]),
      `[foo, bar baz, "qux\\"quux", %OS%, &<>, "&<\\>\\]`
    );
  });

  tsa(`${title} #40`, async (t) => {
    const ec = c([`npm`, `-v`]);
    t.truthy(semver.valid(await sc(ec)));
  });

  tsa(`${title} #41`, async (t) => {
    const ec = bc([
      q(join(testResDir, `with spaces script.ps1`)),
      q(`foo`),
      q(''),
      q('bar baz'),
    ]);
    t.is(await sc(ec), `[foo, , bar baz]`);
  });

  tsa(`${title} #50`, async (t) => {
    const ec = c([`cat`, q(join(testDataDir, `&`, `bar.txt`))]);
    t.is(await sc(ec), `bar`);
  });

  tsa(`${title} #51`, async (t) => {
    const ec = c([`cat`, join(testDataDir, `&`, `bar.txt`)]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #52`, async (t) => {
    const ec = c([`ls`, q(join(testDataDir, `& and dir`))]);
    return t.notThrowsAsync(constant(sc(ec)));
  });

  tsa(`${title} #53`, async (t) => {
    const ec = c([`ls`, join(testDataDir, `& and dir`)]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #54`, async (t) => {
    const ec = c([`cat`, q(join(testDataDir, `%OS%`, `qux.txt`))]);
    t.is(await sc(ec), `qux`);
  });

  tsa(`${title} #55`, async (t) => {
    const ec = c([`cat`, join(testDataDir, `%OS%`, `qux.txt`)]);
    t.is(await sc(ec), `qux`);
  });

  tsa(`${title} #56`, async (t) => {
    const ec = c([`cat`, q(join(testDataDir, `%OS% dir`, `quux.txt`))]);
    t.is(await sc(ec), `quux`);
  });

  tsa(`${title} #57`, async (t) => {
    const ec = c([`cat`, join(testDataDir, `%OS% dir`, `quux.txt`)]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #58`, async (t) => {
    const ec = c([`cat`, q(join(testDataDir, `$SHELL`, `corge.txt`))]);
    t.is(await sc(ec), `corge`);
  });

  tsa(`${title} #59`, async (t) => {
    const ec = c([`cat`, join(testDataDir, `$SHELL`, `corge.txt`)]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #60`, async (t) => {
    const ec = c([`cat`, q(join(testDataDir, `$SHELL dir`, `grault.txt`))]);
    t.is(await sc(ec), `grault`);
  });

  tsa(`${title} #61`, async (t) => {
    const ec = c([`cat`, join(testDataDir, `$SHELL dir`, `grault.txt`)]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #62`, async (t) => {
    const ec = c([`cat`, q(join(testDataDir, `%OS% $SHELL.txt`))]);
    t.is(await sc(ec), `%OS% $SHELL`);
  });

  tsa(`${title} #63`, async (t) => {
    const ec = c([`cat`, join(testDataDir, `%OS% $SHELL.txt`)]);
    return t.throwsAsync(constant(sc(ec)));
  });
}

function testSpawnNest(c: CommandBuilder, nq: (a: string) => string) {
  const [sn] = c([`man`]);
  const title = `spawn nest ${sn} @${platform()}`;
  const sc = spawnCommand(spawnOpts);
  const ctxPred = contextPred(sn);
  const ctxPredNps = contextPredNps(sn);

  function ntsa(
    tag: string,
    pred: (ctx: TestContext) => boolean,
    target: readonly string[],
    expect: string
  ) {
    const tsa = makeConditionalTest(test, pred);
    const bc = c([wq(nodeBin), wq(showArgsFile), ...target]);

    tsa(`${title} ${tag} #1`, async (t) => {
      const ec = c([wq(bc[0]), ...bc[1]].map(nq));
      t.is(await sc(ec), expect);
    });

    tsa(`${title} ${tag} #2`, async (t) => {
      const c2 = c([wq(bc[0]), ...bc[1]].map(nq));
      const ec = c([wq(c2[0]), ...c2[1]].map(nq));
      t.is(await sc(ec), expect);
    });

    tsa(`${title} ${tag} #3`, async (t) => {
      const c2 = c([wq(bc[0]), ...bc[1]].map(nq));
      const c3 = c([wq(c2[0]), ...c2[1]].map(nq));
      const ec = c([wq(c3[0]), ...c3[1]].map(nq));
      t.is(await sc(ec), expect);
    });
  }

  ntsa(`plain short`, ctxPred, [wq(`foo`), `bar`], `[foo, bar]`);

  ntsa(`contains empty`, ctxPred, [wq(`foo`), wq(``), `bar`], `[foo, , bar]`);

  ntsa(
    `special symbols`,
    ctxPredNps,
    [wq(`&()[]{}^=;!'+,\`~|<>TAB\tSP  \\":`)],
    `[&()[]{}^=;!'+,\`~|<>TAB\tSP  \\":]`
  );

  ntsa(
    `plain long`,
    ctxPred,
    [
      wq(`foo`),
      wq(``),
      wq(`bar baz`),
      wq(`"qux\\"quux"`),
      wq(`%OS%`),
      wq(`$env:OS`),
      wq(`$\{env:OS}`),
      wq(`$SHELL`),
      wq(`$\{SHELL}`),
      wq(`&()[]{}=;!'+,\`~|<>:\\`),
    ],
    `[foo, , bar baz, "qux\\"quux", %OS%, $env:OS, $\{env:OS}, $SHELL, $\{SHELL}, &()[]{}=;!'+,\`~|<>:\\]`
  );

  ntsa(`expr`, ctxPred, [wq(`$(1 + 2)`), `$(1 + 2)`], `[$(1 + 2), 3]`);
}

function testCommand(
  c: CommandBuilder,
  bc: CommandBuilder,
  nq: (a: string) => string
) {
  testBefore(c);
  testSpawn(c, bc);
  testSpawnNest(c, nq);
}

if (isWin) {
  testCommand(wCommand, customCommand(wargQuote)([`-ep`, `Bypass`])(shell), q);
  testCommand(
    customCommand(wargQuote)([])(`powershell`),
    customCommand(wargQuote)([`-ep`, `Bypass`])(`powershell`),
    q
  );
} else {
  testCommand(command, customCommand(identity)([`-ep`, `Bypass`])(shell), wq);
}
