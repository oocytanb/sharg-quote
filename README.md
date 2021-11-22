# sharg-quote

A Node library for shell quoting/escaping.

## Installation

[Node.js](https://nodejs.org/) >= 16

```
npm i github:oocytanb/sharg-quote
```

## Examples

### POSIX shell

```typescript
import { spawnSync } from 'child_process';
import { sh } from 'sharg-quote';

const { quote: q, command: c } = sh;

const [cmd, args] = c([
    q(`node`),
    q(`test/res/show_args.mjs`),
    q(`foo`),
    q(`bar " ' baz`),
]);

const r = spawnSync(cmd, args, {
    windowsVerbatimArguments: true,
});
```

```typescript
import { spawnSync } from 'child_process';
import { sh } from 'sharg-quote';

const { quote: q, command: c } = sh;

const [cmd, args] = c([
    q(`echo`),
    q(`foo`),
    q(`bar " ' baz`),
    '`expr 1 + 2`',
]);

const r = spawnSync(cmd, args, {
    windowsVerbatimArguments: true,
});
```

### Windows pwsh

```typescript
import { spawnSync } from 'child_process';
import { pwsh } from 'sharg-quote';

const { quote: q, wQuote: wq, wCommand: c } = pwsh;

const [cmd, args] = c([
    q(`node`),
    wq(`test/res/show_args.mjs`),
    wq(`foo`),
    wq(`bar " ' baz`),
]);

const r = spawnSync(cmd, args, {
    windowsVerbatimArguments: true,
});
```

```typescript
import { spawnSync } from 'child_process';
import { pwsh } from 'sharg-quote';

const { quote: q, wCommand: c } = pwsh;

const [cmd, args] = c([q(`echo`), q(`foo`), q(`bar " ' baz`), `$(1+2)`]);

const r = spawnSync(cmd, args, {
    windowsVerbatimArguments: true,
});
```

### Windows cmd.exe

```typescript
import { spawnSync } from 'child_process';
import { wcmd } from 'sharg-quote';

const { quote: q, wCommand: c } = wcmd;

const [cmd, args] = c([
    q(`node`),
    q(`test/res/show_args.mjs`),
    q(`foo`),
    q(`bar " ' baz`),
]);

const r = spawnSync(cmd, args, {
    windowsVerbatimArguments: true,
});
```

```typescript
import { spawnSync } from 'child_process';
import { wcmd } from 'sharg-quote';

const { escape: esc, quote: q, wCommand: c } = wcmd;

const [cmd, args] = c([q(`echo`), esc(`foo`), esc(`bar " ' baz`), `%OS%`]);

const r = spawnSync(cmd, args, {
    windowsVerbatimArguments: true,
});
```

### [More examples](./test/)