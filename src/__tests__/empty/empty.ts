import { existsSync, rmdirSync } from 'fs';
import { convertFromDirectory } from '../../index';

describe('empty schema directory', () => {
  const typeOutputDirectory = './src/__tests__/empty/interfaces';

  beforeEach(() => {
    rmdirSync(typeOutputDirectory, { recursive: true });
  });

  test('Throw and no index file', async () => {
    expect(async () => {
      await convertFromDirectory({
        schemaDirectory: './src/__tests__/empty/schemas',
        typeOutputDirectory
      });
    }).rejects.toThrowError();

    expect(existsSync(`${typeOutputDirectory}/index.ts`)).toBeFalsy();
  });
});
