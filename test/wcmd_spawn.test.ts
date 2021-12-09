/*! SPDX-License-Identifier: MIT */

import test from 'ava';

import { platform } from 'os';
import { join } from 'path';

import semver from 'semver';

import { constant } from '../lib/fun.js';

import {
  escape as esc,
  quote as q,
  shell,
  customCommand,
  wCommand,
} from '../lib/wcmd.js';

import {
  nodeBin,
  showArgsFile,
  testResDir,
  testDataDir,
  spawnCommand,
} from './helper.js';

const isWin = platform() === 'win32';

const spawnOpts = {
  windowsVerbatimArguments: true,
};

function testSpawn() {
  const title = `spawn @${platform()}`;
  const c = wCommand;
  const sc = spawnCommand(spawnOpts);
  const sa = (args: readonly string[]) =>
    sc(c([q(nodeBin), q(showArgsFile), ...args]));
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
        q(``),
        q(`foo`),
        `bar`,
        q(`baz qux`),
        q(`quux\tcorge`),
        q(`\\gr\\"au"lt`),
        q(`"gar\\ply\\`),
        q(`'wal'do'`),
      ]),
      `[, foo, bar, baz qux, quux\tcorge, \\gr\\"au"lt, "gar\\ply\\, 'wal'do']`
    );
  });

  tsa(`${title} #5`, async (t) => {
    t.is(
      await sa([
        ``,
        `foo`,
        `bar`,
        `baz qux`,
        `quux\tcorge`,
        `\\gr\\"au"lt`,
        `"gar\\ply\\`,
        `'wal'do'`,
      ]),
      `[foo, bar, baz, qux, quux, corge, \\gr"ault gar\\ply\\, 'wal'do']`
    );
  });

  tsa(`${title} #6`, async (t) => {
    t.is(
      await sa([q(`&()[]{}^=;!'+,\`~|<>%OS%TAB\tSP  \\":`)]),
      `[&()[]{}^=;!'+,\`~|<>%OS%TAB\tSP  \\":]`
    );
  });

  tsa(`${title} #7`, async (t) => {
    t.is(
      await sa([q(`\`"' {}();,|&@$<>[]+.:!*/%=#-\\`)]),
      `[\`"' {}();,|&@$<>[]+.:!*/%=#-\\]`
    );
  });

  tsa(`${title} #8`, async (t) => {
    t.is(
      await sa([
        q(`foo`),
        q(`bar baz`),
        q(`"qux\\"quux"`),
        q(`%OS%`),
        q(`&<>`),
        q(`"&<\\>\\`),
        q(`\n\t`),
        q(`\b\f\v\u007F\u0008`),
      ]),
      `[foo, bar baz, "qux\\"quux", %OS%, &<>, "&<\\>\\,  \t, \b\f\v\u007F\u0008]`
    );
  });

  tsa(`${title} #9`, async (t) => {
    t.is(await sa([`%OS%`]), `[Windows_NT]`);
  });

  tsa(`${title} #10`, async (t) => {
    const ec = c([
      `echo`,
      esc(`foo`),
      esc(`bar baz`),
      esc(`"qux\\"quux"`),
      esc(`%OS%`),
      `%OS%`,
      esc(`%&|<>^`),
      esc(`()[]{}^=;!'+,\`~$#`),
    ]);
    t.is(
      await sc(ec),
      `foo bar baz "qux\\"quux" %OS% Windows_NT %&|<>^ ()[]{}^=;!'+,\`~$#`
    );
  });

  tsa(`${title} #11`, async (t) => {
    const ec = c([`echo.`]);
    t.is(await sc(ec), ``);
  });

  tsa(`${title} #12`, async (t) => {
    const ec = customCommand([`/e:on`])(shell)([
      `if`,
      `/i`,
      `Foo`,
      `equ`,
      `foo`,
      `echo`,
      `OK`,
    ]);
    t.is(await sc(ec), `OK`);
  });

  tsa(`${title} #13`, async (t) => {
    const ec = customCommand([`/e:off`])(shell)([
      `if`,
      `/i`,
      `Foo`,
      `equ`,
      `foo`,
      `echo`,
      `OK`,
    ]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #40`, async (t) => {
    const ec = c([`npm`, `-v`]);
    t.truthy(semver.valid(await sc(ec)));
  });

  tsa(`${title} #41`, async (t) => {
    const ec = c([
      q(join(testResDir, `with spaces script.cmd`)),
      q(`foo`),
      q(''),
      q('bar baz'),
    ]);
    t.is(await sc(ec), `[foo, , bar baz]`);
  });

  tsa(`${title} #50`, async (t) => {
    const ec = c([`more`, q(join(testDataDir, `&`, `bar.txt`))]);
    t.is(await sc(ec), `bar`);
  });

  tsa(`${title} #51`, async (t) => {
    const ec = c([`more`, join(testDataDir, `&`, `bar.txt`)]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #52`, async (t) => {
    const ec = c([`dir`, q(join(testDataDir, `& and dir`))]);
    return t.notThrowsAsync(constant(sc(ec)));
  });

  tsa(`${title} #53`, async (t) => {
    const ec = c([`dir`, join(testDataDir, `& and dir`)]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #54`, async (t) => {
    const ec = c([`more`, q(join(testDataDir, `%OS%`, `qux.txt`))]);
    t.is(await sc(ec), `qux`);
  });

  tsa(`${title} #55`, async (t) => {
    const ec = c([`more`, join(testDataDir, `%OS%`, `qux.txt`)]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #56`, async (t) => {
    const ec = c([`more`, q(join(testDataDir, `%OS% dir`, `quux.txt`))]);
    t.is(await sc(ec), `quux`);
  });

  tsa(`${title} #57`, async (t) => {
    const ec = c([`more`, join(testDataDir, `%OS% dir`, `quux.txt`)]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #58`, async (t) => {
    const ec = c([`more`, q(join(testDataDir, `$SHELL`, `corge.txt`))]);
    t.is(await sc(ec), `corge`);
  });

  tsa(`${title} #59`, async (t) => {
    const ec = c([`more`, join(testDataDir, `$SHELL`, `corge.txt`)]);
    t.is(await sc(ec), `corge`);
  });

  tsa(`${title} #60`, async (t) => {
    const ec = c([`more`, q(join(testDataDir, `$SHELL dir`, `grault.txt`))]);
    t.is(await sc(ec), `grault`);
  });

  tsa(`${title} #61`, async (t) => {
    const ec = c([`more`, join(testDataDir, `$SHELL dir`, `grault.txt`)]);
    return t.throwsAsync(constant(sc(ec)));
  });

  tsa(`${title} #62`, async (t) => {
    const ec = c([`more`, q(join(testDataDir, `%OS% $SHELL.txt`))]);
    t.is(await sc(ec), `%OS% $SHELL`);
  });

  tsa(`${title} #63`, async (t) => {
    const ec = c([`more`, join(testDataDir, `%OS% $SHELL.txt`)]);
    return t.throwsAsync(constant(sc(ec)));
  });
}

function testSpawnNest() {
  const title = `spawn nest @${platform()}`;
  const c = wCommand;
  const sc = spawnCommand(spawnOpts);
  const tsa = test.serial;

  function ntsa(tag: string, target: readonly string[], expect: string) {
    const bc = c([q(nodeBin), q(showArgsFile), ...target]);
    const nc1 = c([q(bc[0]), ...bc[1]].map(esc));
    const nc2 = c([q(nc1[0]), ...nc1[1]].map(esc));
    const nc3 = c([q(nc2[0]), ...nc2[1]].map(esc));

    tsa(`${title} ${tag} #1`, async (t) => {
      t.is(await sc(nc1), expect);
    });

    tsa(`${title} ${tag} #2`, async (t) => {
      t.is(await sc(nc2), expect);
    });

    tsa(`${title} ${tag} #3`, async (t) => {
      t.is(await sc(nc3), expect);
    });
  }

  ntsa(`plain short`, [q(`foo`), `bar`], `[foo, bar]`);

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

  ntsa(`env var`, [`%OS%`, q(`%OS%`)], '[Windows_NT, %OS%]');
}

function testSpawnCmdletNest() {
  const title = `spawn nest @${platform()}`;
  const c = wCommand;
  const sc = spawnCommand(spawnOpts);
  const tsa = test.serial;

  function ntsa(tag: string, target: readonly string[], expect: string) {
    const bc = c(target);
    const nc1 = c([q(bc[0]), ...bc[1].map(esc)]);
    const nc2 = c([q(nc1[0]), ...nc1[1].map(esc)]);
    const nc3 = c([q(nc2[0]), ...nc2[1].map(esc)]);

    tsa(`${title} ${tag} #1`, async (t) => {
      t.is(await sc(nc1), expect);
    });

    tsa(`${title} ${tag} #2`, async (t) => {
      t.is(await sc(nc2), expect);
    });

    tsa(`${title} ${tag} #3`, async (t) => {
      t.is(await sc(nc3), expect);
    });
  }

  ntsa(
    `echo long`,
    [
      `echo`,
      esc(`foo`),
      esc(`bar baz`),
      esc(`"qux\\"quux"`),
      esc(`%OS%`),
      `%OS%`,
      esc(`%&|<>^`),
      esc(`()[]{}^=;!'+,\`~$#`),
    ],
    `foo bar baz "qux\\"quux" %OS% Windows_NT %&|<>^ ()[]{}^=;!'+,\`~$#`
  );

  ntsa(`if compare`, [`if`, `/i`, `Foo`, `equ`, `foo`, `echo`, `OK`], `OK`);
}

if (isWin) {
  testSpawn();
  testSpawnNest();
  testSpawnCmdletNest();
} else {
  test.skip(`spawn @${platform()}`, () => void 0);
}
