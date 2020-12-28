import { rmdirSync, existsSync } from 'fs';

import { convertFromDirectory } from '../../index';

describe('ignore Files', () => {
  const typeOutputDirectory = './src/__tests__/ignoreFiles/models';
  const schemaDirectory = './src/__tests__/ignoreFiles/schemas';

  beforeEach(() => {
    rmdirSync(typeOutputDirectory, { recursive: true });
  });

  test('Ignores file names in ignoreList', async () => {
    const ignoreFiles = ['AddressSchema.ts'];
    const result = await convertFromDirectory({
      schemaDirectory,
      typeOutputDirectory,
      ignoreFiles
    });

    expect(result).toBe(true);

    expect(existsSync(`${typeOutputDirectory}/index.ts`)).toBeTruthy();
    expect(existsSync(`${typeOutputDirectory}/One.ts`)).toBeTruthy();
    expect(existsSync(`${typeOutputDirectory}/subDir/index.ts`)).toBeTruthy();
    expect(existsSync(`${typeOutputDirectory}/subDir/Person.ts`)).toBeTruthy();
    expect(existsSync(`${typeOutputDirectory}/subDir/Address.ts`)).toBeFalsy();
    expect(existsSync(`${typeOutputDirectory}/subDir2/index.ts`)).toBeTruthy();
    expect(existsSync(`${typeOutputDirectory}/subDir2/Employee.ts`)).toBeTruthy();
  });

  test('Ignores folder names in ignoreList', async () => {
    const ignoreFiles = ['subDir/'];
    const result = await convertFromDirectory({
      schemaDirectory,
      typeOutputDirectory,
      ignoreFiles
    });

    expect(result).toBe(true);

    expect(existsSync(`${typeOutputDirectory}/index.ts`)).toBeTruthy();
    expect(existsSync(`${typeOutputDirectory}/One.ts`)).toBeTruthy();
    expect(existsSync(`${typeOutputDirectory}/subDir/index.ts`)).toBeFalsy();
    expect(existsSync(`${typeOutputDirectory}/subDir/Person.ts`)).toBeFalsy();
    expect(existsSync(`${typeOutputDirectory}/subDir/Address.ts`)).toBeFalsy();
    expect(existsSync(`${typeOutputDirectory}/subDir2/index.ts`)).toBeTruthy();
    expect(existsSync(`${typeOutputDirectory}/subDir2/Employee.ts`)).toBeTruthy();
  });

  test('Ignores a file and folder in an ignore list', async () => {
    const ignoreFiles = ['subDir2/', 'OneSchema.ts'];
    const result = await convertFromDirectory({
      schemaDirectory,
      typeOutputDirectory,
      ignoreFiles
    });

    expect(result).toBe(true);

    expect(existsSync(`${typeOutputDirectory}/index.ts`)).toBeTruthy();
    expect(existsSync(`${typeOutputDirectory}/One.ts`)).toBeFalsy();
    expect(existsSync(`${typeOutputDirectory}/subDir/index.ts`)).toBeTruthy();
    expect(existsSync(`${typeOutputDirectory}/subDir/Person.ts`)).toBeTruthy();
    expect(existsSync(`${typeOutputDirectory}/subDir/Address.ts`)).toBeTruthy();
    expect(existsSync(`${typeOutputDirectory}/subDir2/index.ts`)).toBeFalsy();
    expect(existsSync(`${typeOutputDirectory}/subDir2/Employee.ts`)).toBeFalsy();
  });
});
