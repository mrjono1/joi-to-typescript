import {existsSync, readFileSync, rmdirSync} from 'fs';

import {convertFromDirectory} from '../../index';

const typeOutputDirectory = './src/__tests__/noIndex/interfaces';

describe('Create interfaces from schema files but not index files', () => {
  beforeAll(() => {
    if (existsSync(typeOutputDirectory)) {
      rmdirSync(typeOutputDirectory, {recursive: true});
    }
  });

  test('generates interfaces but no index files', async () => {
    const result = await convertFromDirectory({
      schemaDirectory: './src/__tests__/noIndex/schemas',
      omitIndexFiles: true,
      typeOutputDirectory
    });

    expect(result)
      .toBe(true);

    expect(existsSync(`${typeOutputDirectory}/index.ts`))
      .toBe(false)

    const fooBarContent = readFileSync(`${typeOutputDirectory}/FooBar.ts`).toString();

    // The import should properly point to a file, and not to the root folder
    expect(fooBarContent).toContain(`import { InnerInterface } from './Inner';`)
  });
});
