import { rmdirSync, existsSync, readFileSync } from 'fs';

import { convertFromDirectory } from '../../index';

describe('Ignore Index Files', () => {
  const typeOutputDirectory = './src/__tests__/ignoreIndexFiles/interfaces';
  const schemaDirectory = './src/__tests__/ignoreIndexFiles/schemas';

  beforeEach(() => {
    if (existsSync(typeOutputDirectory)) {
      rmdirSync(typeOutputDirectory, { recursive: true });
    }
  });

  test('Processes index files by default', async () => {
    const result = await convertFromDirectory({
      schemaDirectory,
      typeOutputDirectory
    });

    expect(result).toBe(true);

    expect(existsSync(`${typeOutputDirectory}/Person.ts`)).toBeTruthy();
    expect(existsSync(`${typeOutputDirectory}/Address.ts`)).toBeTruthy();

    // Index should exist and should include the definitions inline
    expect(existsSync(`${typeOutputDirectory}/index.ts`)).toBeTruthy();
    const indexContents = readFileSync(`${typeOutputDirectory}/index.ts`, 'utf8');
    expect(/^export interface Address \{/gm.test(indexContents)).toBeTruthy();
    expect(/^export interface Person \{/gm.test(indexContents)).toBeTruthy();
  });

  test('Ignores index files if requested', async () => {
    const ignoreIndexFiles = true;
    const result = await convertFromDirectory({
      schemaDirectory,
      typeOutputDirectory,
      ignoreIndexFiles
    });

    expect(result).toBe(true);

    expect(existsSync(`${typeOutputDirectory}/Person.ts`)).toBeTruthy();
    expect(existsSync(`${typeOutputDirectory}/Address.ts`)).toBeTruthy();

    // Index should exist but should just be exporting the definitions in the
    // other generated files.
    expect(existsSync(`${typeOutputDirectory}/index.ts`)).toBeTruthy();
    const indexContents = readFileSync(`${typeOutputDirectory}/index.ts`, 'utf8');
    expect(/^export \* from '.\/Address';$/gm.test(indexContents)).toBeTruthy();
    expect(/^export \* from '.\/Person';$/gm.test(indexContents)).toBeTruthy();
  });

  test('Ignores index files if requested with debug', async () => {
    const ignoreIndexFiles = true;
    const debug = true;
    const result = await convertFromDirectory({
      schemaDirectory,
      typeOutputDirectory,
      ignoreIndexFiles,
      debug
    });

    expect(result).toBe(true);

    expect(existsSync(`${typeOutputDirectory}/Person.ts`)).toBeTruthy();
    expect(existsSync(`${typeOutputDirectory}/Address.ts`)).toBeTruthy();

    // Index should exist but should just be exporting the definitions in the
    // other generated files.
    expect(existsSync(`${typeOutputDirectory}/index.ts`)).toBeTruthy();
    const indexContents = readFileSync(`${typeOutputDirectory}/index.ts`, 'utf8');
    expect(/^export \* from '.\/Address';$/gm.test(indexContents)).toBeTruthy();
    expect(/^export \* from '.\/Person';$/gm.test(indexContents)).toBeTruthy();
  });
});
