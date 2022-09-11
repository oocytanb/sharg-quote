# sharg-quote

[![Node CI](https://github.com/oocytanb/sharg-quote/actions/workflows/node_ci.yml/badge.svg)](https://github.com/oocytanb/sharg-quote/actions/workflows/node_ci.yml)

A Node library for quoting/escaping shell commands.

## Installation

[Node.js](https://nodejs.org/) >= 18

```
npm i github:oocytanb/sharg-quote
```

## Examples

### POSIX shell

```javascript
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
```

```javascript
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
```

### Windows pwsh

```javascript
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
```

```javascript
import { spawn } from 'child_process';
import { pwsh } from 'sharg-quote';

function run() {
  const { quote: q, wCommand: c } = pwsh;

  const [cmd, args] = c([q(`echo`), q(`foo`), q(`bar " ' baz`), `$(1+2)`]);

  return spawn(cmd, args, {
    windowsVerbatimArguments: true,
  });
}
```

### Windows cmd.exe

```javascript
import { spawn } from 'child_process';
import { wcmd } from 'sharg-quote';

function run() {
  const { quote: q, wCommand: c } = wcmd;

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
```

```javascript
import { spawn } from 'child_process';
import { wcmd } from 'sharg-quote';

function run() {
  const { escape: esc, quote: q, wCommand: c } = wcmd;

  const [cmd, args] = c([q(`echo`), esc(`foo`), esc(`bar " ' baz`), `%OS%`]);

  return spawn(cmd, args, {
    windowsVerbatimArguments: true,
  });
}
```

### [More examples](./test/)

## Build

Install [pnpm](https://pnpm.io/)

```
corepack enable pnpm
corepack prepare pnpm@7.11.0 --activate
```

Build

```
pnpm i
pnpm run build
pnpm run test_c
```

## Libraries

[See dependencies](./package.json)
