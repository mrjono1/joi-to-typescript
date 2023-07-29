import {existsSync, rmdirSync} from 'fs';

import {convertFromDirectory} from '../../index';

const typeOutputDirectory = './src/__tests__/interfaceFileSuffix/interfaces';

describe('Create interfaces from schema files with a suffix in the interface filename', () => {
  beforeAll(() => {
    if (existsSync(typeOutputDirectory)) {
      rmdirSync(typeOutputDirectory, {recursive: true});
    }
  });

  test('generates interfaces but no index files', async () => {
    const result = await convertFromDirectory({
      schemaDirectory: './src/__tests__/interfaceFileSuffix/schemas',
      interfaceFileSuffix: '.generated',
      typeOutputDirectory
    });

    expect(result)
      .toBe(true);

    expect(existsSync(`${typeOutputDirectory}/One.generated.ts`))
      .toBe(true)

    // Index file should be untouched
    expect(existsSync(`${typeOutputDirectory}/index.ts`))
      .toBe(true)
  });
});
