import console from 'console';
import { argv } from 'process';

const a = argv.slice(2);
if (a.length === 0) {
  console.log(`__EMPTY__`);
} else {
  console.log(`[${argv.slice(2).join(', ')}]`);
}
