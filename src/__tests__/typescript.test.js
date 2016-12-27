/* eslint-env jest */
import * as path from 'path';
import { compileDirectory } from 'typescript-definition-tester';

describe('TypeScript definitions', () => {
  it('compile against index.d.ts', (done) => {
    compileDirectory(
      path.resolve(__dirname, 'typescript'),
      (fileName) => fileName.match(/\.ts$/),
      done
    );
  });
});
