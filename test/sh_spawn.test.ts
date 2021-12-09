/*! SPDX-License-Identifier: MIT */

import testFn, { TestFn } from 'ava';

import * as process from 'process';
import { platform } from 'os';
import { basename, extname, join, normalize } from 'path';

import upath from 'upath';
import semver from 'semver';

import { constant } from '../lib/fun.js';
import { Command } from '../lib/xcommand.js';

import {
  quote as q,
  customCommand,
  pShellCommand,
  wShellCommand,
  command,
} from '../lib/sh.js';

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

type CommandVersionInfo = {
  bin: string;
  source: string;
  title?: string;
  version?: string;
  platform?: string;
};

type TestContext = {
  probeSet?: Record<string, CommandVersionInfo>;
};

const test = testFn as TestFn<TestContext>;

const isWin = platform() === 'win32';

const spawnOpts = {
  windowsVerbatimArguments: true,
};

function contextPred(sn: string): (ctx: TestContext) => boolean {
  return (ctx) => {
    const ver = ctx?.probeSet?.[sn];
    return (
      !!ver && !(isWin && ver.bin === 'bash' && ver.platform?.includes('linux'))
    );
  };
}

async function probeVersion(sn: string): Promise<CommandVersionInfo> {
  const bn = basename(sn);
  const bsn = bn.substring(0, bn.length - extname(sn).length);

  if (bsn === 'bash') {
    const full = (await asyncSpawn(sn, ['--version'])).stdout;
    const lfPos = full.indexOf('\n');
    const source = (lfPos < 0 ? full : full.substring(0, lfPos)).trim();
    const m = /^([^,]+)(?:,)?\s*(?:version\s*([\S]*))?\s*(?:\(([^)]+)\))?/.exec(
      source
    );
    return {
      bin: sn,
      source,
      title: m?.[1]?.trim(),
      version: m?.[2]?.trim(),
      platform: m?.[3]?.trim(),
    };
  } else {
    return {
      bin: sn,
      source: '',
    };
  }
}

function testBefore(c: CommandBuilder) {
  const [cn, echoArgs] = c([`echo`, `foo`]);

  test.serial.before(`probe spawn ${cn} @${platform()}`, async (t) => {
    try {
      const ver = await probeVersion(cn);
      if (ver.source) {
        t.log(ver);
      }

      await asyncSpawn(cn, echoArgs, spawnOpts);
      t.context.probeSet = { ...t.context.probeSet, [cn]: ver };
    } catch (err) {
      t.log(`Could not execute "${cn}": ${err}`);
    }
  });
}

function testSpawn(c: CommandBuilder) {
  const np = upath.normalizeSafe;
  const [sn] = c([`man`]);
  const title = `spawn ${sn} @${platform()}`;
  const sc = spawnCommand(spawnOpts);
  const sa = (args: readonly string[]) =>
    sc(c([q(nodeBin), q(showArgsFile), ...args]));

  const pred = contextPred(sn);
  const tsa = makeConditionalTest(test.serial, pred);
  const tsaNwsl = makeConditionalTest(
    test.serial,
    (ctx: TestContext) =>
      !(isWin && ctx.probeSet?.[sn]?.platform?.includes('linux')) && pred(ctx)
  );

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
    t.is(await sa([q(`"foo bar`)]), `["foo bar]`);
  });

  tsa(`${title} #5`, async (t) => {
    t.is(await sa([q(`'`)]), `[']`);
  });

  tsa(`${title} #6`, async (t) => {
    t.is(await sa([q(`' `)]), `[' ]`);
  });

  tsa(`${title} #7`, async (t) => {
    t.is(await sa([q(`' foo`)]), `[' foo]`);
  });

  tsa(`${title} #8`, async (t) => {
    t.is(await sa([q(`"' foo`)]), `["' foo]`);
  });

  tsa(`${title} #9`, async (t) => {
    t.is(await sa([q(`"'foo`)]), `["'foo]`);
  });

  tsa(`${title} #10`, async (t) => {
    t.is(await sa([q(`$SHELL`)]), `[$SHELL]`);
  });

  tsa(`${title} #11`, async (t) => {
    t.is(
      await sa([
        q(``),
        q(`foo`),
        `bar`,
        q(`baz qux`),
        q(`quux\tcorge`),
        q(`\\gr\\"au"lt`),
        q(`gar\\ply\\`),
        q(`'wal'do'`),
      ]),
      `[, foo, bar, baz qux, quux\tcorge, \\gr\\"au"lt, gar\\ply\\, 'wal'do']`
    );
  });

  tsa(`${title} #12`, async (t) => {
    t.is(
      await sa([
        q(``),
        q(`foo`),
        q(`bar`),
        q(`baz qux`),
        q(`quux\tcorge`),
        q(`\\gr\\"au"lt`),
        q(`gar\\ply\\`),
        q(`'wal'do'`),
      ]),
      `[, foo, bar, baz qux, quux\tcorge, \\gr\\"au"lt, gar\\ply\\, 'wal'do']`
    );
  });

  tsa(`${title} #13`, async (t) => {
    t.is(
      await sa([q(`&()[]{}^=;!'+,\`~|<>%OS%TAB\tSP  \\":`)]),
      `[&()[]{}^=;!'+,\`~|<>%OS%TAB\tSP  \\":]`
    );
  });

  tsa(`${title} #14`, async (t) => {
    t.is(
      await sa([q(`\`"' {}();,|&@$<>[]+.:!*/%=#-\\`)]),
      `[\`"' {}();,|&@$<>[]+.:!*/%=#-\\]`
    );
  });

  tsa(`${title} #15`, async (t) => {
    t.is(
      await sa([
        q(`foo`),
        q(`bar baz`),
        q(`"qux\\"quux"`),
        q(`%OS%`),
        q(`&<>`),
        q(`"&<\\>\\`),
      ]),
      `[foo, bar baz, "qux\\"quux", %OS%, &<>, "&<\\>\\]`
    );
  });

  tsa(`${title} #16`, async (t) => {
    t.is(await sa([q(`'foo'`), q(`$SHELL`)]), `['foo', $SHELL]`);
  });

  tsa(`${title} #17`, async (t) => {
    t.is(await sa([q(`'foo'`)]), `['foo']`);
  });

  tsa(`${title} #18`, async (t) => {
    t.is(await sa([q('`expr 1 + 2`'), '`expr 1 + 2`']), '[`expr 1 + 2`, 3]');
  });

  tsaNwsl(`${title} #40`, async (t) => {
    const ec = c([`npm`, `-v`]);
    t.truthy(semver.valid(await sc(ec)));
  });

  tsa(`${title} #41`, async (t) => {
    const ec = c([
      q(np(join(testResDir, `with spaces script`))),
      q(`foo`),
      q(''),
      q('bar baz'),
    ]);
    t.is(await sc(ec), `[foo, , bar baz]`);
  });

  tsa(`${title} #50`, async (t) => {
    const ec = c([`cat`, q(np(join(testDataDir, `&`, `bar.txt`)))]);
    t.is(await sc(ec), `bar`);
  });

  tsa(`${title} #51`, async (t) => {
    const ec = c([`cat`, np(join(testDataDir, `&`, `bar.txt`))]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #52`, async (t) => {
    const ec = c([`ls`, q(np(join(testDataDir, `& and dir`)))]);
    return t.notThrowsAsync(constant(sc(ec)));
  });

  tsa(`${title} #53`, async (t) => {
    const ec = c([`ls`, np(join(testDataDir, `& and dir`))]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #54`, async (t) => {
    const ec = c([`cat`, q(np(join(testDataDir, `%OS%`, `qux.txt`)))]);
    t.is(await sc(ec), `qux`);
  });

  tsa(`${title} #55`, async (t) => {
    const ec = c([`cat`, np(join(testDataDir, `%OS%`, `qux.txt`))]);
    t.is(await sc(ec), `qux`);
  });

  tsa(`${title} #56`, async (t) => {
    const ec = c([`cat`, q(np(join(testDataDir, `%OS% dir`, `quux.txt`)))]);
    t.is(await sc(ec), `quux`);
  });

  tsa(`${title} #57`, async (t) => {
    const ec = c([`cat`, np(join(testDataDir, `%OS% dir`, `quux.txt`))]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #58`, async (t) => {
    const ec = c([`cat`, q(np(join(testDataDir, `$SHELL`, `corge.txt`)))]);
    t.is(await sc(ec), `corge`);
  });

  tsa(`${title} #59`, async (t) => {
    const ec = c([`cat`, np(join(testDataDir, `$SHELL`, `corge.txt`))]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #60`, async (t) => {
    const ec = c([`cat`, q(np(join(testDataDir, `$SHELL dir`, `grault.txt`)))]);
    t.is(await sc(ec), `grault`);
  });

  tsa(`${title} #61`, async (t) => {
    const ec = c([`cat`, np(join(testDataDir, `$SHELL dir`, `grault.txt`))]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #62`, async (t) => {
    const ec = c([`cat`, q(np(join(testDataDir, `%OS% $SHELL.txt`)))]);
    t.is(await sc(ec), `%OS% $SHELL`);
  });

  tsa(`${title} #63`, async (t) => {
    const ec = c([`cat`, np(join(testDataDir, `%OS% $SHELL.txt`))]);
    return t.throwsAsync(constant(sc(ec)));
  });
}

function testWinPath(c: CommandBuilder) {
  const np = normalize;
  const [sn] = c([`man`]);
  const title = `spawn winPath ${sn} @${platform()}`;
  const sc = spawnCommand(spawnOpts);
  const tsa = makeConditionalTest(test.serial, contextPred(sn));

  tsa(`${title} #54`, async (t) => {
    const ec = c([`cat`, q(np(join(testDataDir, `%OS%`, `qux.txt`)))]);
    t.is(await sc(ec), `qux`);
  });

  tsa(`${title} #55`, async (t) => {
    const ec = c([`cat`, np(join(testDataDir, `%OS%`, `qux.txt`))]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #56`, async (t) => {
    const ec = c([`cat`, q(np(join(testDataDir, `%OS% dir`, `quux.txt`)))]);
    t.is(await sc(ec), `quux`);
  });

  tsa(`${title} #57`, async (t) => {
    const ec = c([`cat`, np(join(testDataDir, `%OS% dir`, `quux.txt`))]);
    return t.throwsAsync(constant(sc(ec)));
  });
}

function testSpawnNest(c: CommandBuilder, nc: CommandBuilder) {
  const [sn] = c([`man`]);
  const title = `spawn nest ${sn} @${platform()}`;
  const sc = spawnCommand(spawnOpts);
  const tsa = makeConditionalTest(test.serial, contextPred(sn));

  function ntsa(tag: string, target: readonly string[], expect: string) {
    const bc = nc([q(nodeBin), q(showArgsFile), ...target]);

    tsa(`${title} ${tag} #1`, async (t) => {
      const ec = c([q(bc[0]), ...bc[1]].map(q));
      t.is(await sc(ec), expect);
    });

    tsa(`${title} ${tag} #2`, async (t) => {
      const c2 = nc([q(bc[0]), ...bc[1]].map(q));
      const ec = c([q(c2[0]), ...c2[1]].map(q));
      t.is(await sc(ec), expect);
    });

    tsa(`${title} ${tag} #3`, async (t) => {
      const c2 = nc([q(bc[0]), ...bc[1]].map(q));
      const c3 = nc([q(c2[0]), ...c2[1]].map(q));
      const ec = c([q(c3[0]), ...c3[1]].map(q));
      t.is(await sc(ec), expect);
    });
  }

  ntsa(`plain short`, [q(`foo`), q(`bar`)], `[foo, bar]`);

  ntsa(
    `plain long`,
    [
      q(``),
      q(`foo`),
      q(`bar baz`),
      q(`"qux\\"quux"`),
      q(`%OS%`),
      q(`$env:OS`),
      q(`$\{env:OS}`),
      q(`$SHELL`),
      q(`$\{SHELL}`),
      q(`&()[]{}=;!'+,\`~|<>:\\`),
      q(`&()[]{}^=;!'+,\`~|<>TAB\tSP  \\":`),
    ],
    `[, foo, bar baz, "qux\\"quux", %OS%, $env:OS, $\{env:OS}, $SHELL, $\{SHELL}, &()[]{}=;!'+,\`~|<>:\\, &()[]{}^=;!'+,\`~|<>TAB\tSP  \\":]`
  );

  ntsa(`expr`, [q('`expr 1 + 2`'), '`expr 1 + 2`'], '[`expr 1 + 2`, 3]');
}

function testCommands(cps: readonly [CommandBuilder, CommandBuilder][]) {
  for (const [c] of cps) {
    testBefore(c);
  }

  for (const [c, nc] of cps) {
    testSpawn(c);
    testSpawnNest(c, nc);
  }
}

if (isWin) {
  const wBash = wShellCommand(`bash`);
  const pBash = pShellCommand(`bash`);
  const wslBash = customCommand(q)([])(
    join(process.env.SystemRoot || ``, `System32`, `bash.exe`)
  );

  const cps: [CommandBuilder, CommandBuilder][] = [
    [wBash, pBash],
    [wslBash, pBash],
  ];

  testCommands(cps);
  testWinPath(wBash);
} else {
  const cs = [
    command,
    pShellCommand(`bash`),
    pShellCommand('dash'),
    pShellCommand('zsh'),
  ];

  const cps: [CommandBuilder, CommandBuilder][] = cs.map((c) => [c, c]);
  testCommands(cps);
}
