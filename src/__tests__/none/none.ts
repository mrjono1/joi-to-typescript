import { existsSync, rmdirSync } from 'fs';
import { convertFromDirectory } from '../../index';

describe('empty schema directory', () => {
  const typeOutputDirectory = './src/__tests__/none/models';

  beforeAll(() => {
    rmdirSync(typeOutputDirectory, { recursive: true });
  });

  test('Throw if no schemas are found ', async () => {
    expect(async () => {
      await convertFromDirectory({
        schemaDirectory: './src/__tests__/none/schemas',
        typeOutputDirectory
      });
    }).rejects.toThrowError();
  });

  test('Ensure that the index file was not created', async () => {
    expect(existsSync(`${typeOutputDirectory}/index.ts`)).toBeFalsy();
  });
});
