import { existsSync, rmdirSync } from 'fs';
import { convertFromDirectory } from '../../index';

describe('no schemas in directory', () => {
  const typeOutputDirectory = './src/__tests__/none/interfaces';

  beforeEach(() => {
    if (existsSync(typeOutputDirectory)) {
      rmdirSync(typeOutputDirectory, { recursive: true });
    }
  });

  test('Throw and no index file', async () => {
    expect(async () => {
      await convertFromDirectory({
        schemaDirectory: './src/__tests__/none/schemas',
        typeOutputDirectory
      });
    }).rejects.toThrowError();

    expect(existsSync(`${typeOutputDirectory}/index.ts`)).toBeFalsy();
  });
});
