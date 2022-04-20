import { existsSync, rmdirSync } from 'fs';
import { convertFromDirectory } from '../..';
import { InputFileFilter } from '../../types';

describe('empty schema directory', () => {
  const typeOutputDirectory = './src/__tests__/files/interfaces';

  beforeAll(() => {
    if (existsSync(typeOutputDirectory)) {
      rmdirSync(typeOutputDirectory, { recursive: true });
    }
  });

  test('does reading form files work', async () => {
    const result = await convertFromDirectory({
      schemaDirectory: './src/__tests__/files/schemas',
      typeOutputDirectory,
      inputFileFilter: InputFileFilter.ExcludeIndex,
      debug: true
    });

    expect(result).toBe(true);

    const baseInterfaceDir = './src/__tests__/files/interfaces/';
    expect(existsSync(`${baseInterfaceDir}One.ts`)).toBe(true);
    expect(existsSync(`${baseInterfaceDir}React.tsx`)).toBe(false);
  });

  test.concurrent.each([
    'index.ts',
    'HelloSchema.ts',
    '/red/HelloSchema.ts',
    '/HelloSchema.ts',
    '/red/blue/BlackSchema.ts'
  ])('Default Regular Expression Valid: %s', async item => {
    expect(InputFileFilter.Default.test(item)).toBeTruthy();
  });

  test.concurrent.each(['index.tsx', 'index.t', 'frank', 'readme.md', 'foo.java', 'bar.js', '/bar.js'])(
    'Default Regular Expression invalid: %s',
    async item => {
      expect(InputFileFilter.Default.test(item)).toBeFalsy();
    }
  );

  test.concurrent.each(['HelloSchema.ts', '/red/HelloSchema.ts', '/HelloSchema.ts', '/red/blue/BlackSchema.ts'])(
    'Exclude Index Regular Expression Valid: %s',
    async item => {
      expect(InputFileFilter.ExcludeIndex.test(item)).toBeTruthy();
    }
  );

  test.concurrent.each(['index.tsx', 'index.ts', 'index.t', 'frank', 'readme.md', 'foo.java', 'bar.js', '/bar.js'])(
    'Exclude Indext Regular Expression Invalid: %s',
    async item => {
      expect(InputFileFilter.ExcludeIndex.test(item)).toBeFalsy();
    }
  );

  test.concurrent.each([
    'index.ts',
    'HelloSchema.ts',
    '/red/HelloSchema.ts',
    '/HelloSchema.ts',
    '/red/blue/BlackSchema.ts',
    'index.js',
    'HelloSchema.js',
    '/red/HelloSchema.js',
    '/HelloSchema.js',
    '/red/blue/BlackSchema.js'
  ])('Include JavaScript Regular Expression Valid: %s', async item => {
    expect(InputFileFilter.IncludeJavaScript.test(item)).toBeTruthy();
  });

  test.concurrent.each(['index.tsx', 'index.jsx', 'index.t', 'frank', 'readme.md', 'foo.java', 'bar.cjs', '/bar.jsm'])(
    'Include JavaScript Regular Expression Invalid: %s',
    async item => {
      expect(InputFileFilter.IncludeJavaScript.test(item)).toBeFalsy();
    }
  );
});
