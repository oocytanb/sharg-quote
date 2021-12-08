import console from 'console';
import cpFile from 'cp-file';
import { globby } from 'globby';

(async () => {
  for (const p of await globby('lib/**/*.d.mts')) {
    const dst = p.replace(/\.d\.mts$/, '.d.ts');
    console.log(dst);
    await cpFile(p, dst);
  }
})();
