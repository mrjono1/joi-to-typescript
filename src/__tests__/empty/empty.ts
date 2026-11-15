import { existsSync, rmSync } from 'fs';
import { convertFromDirectory } from '../../index';

describe('empty schema directory', () => {
  const typeOutputDirectory = './src/__tests__/empty/interfaces';

  beforeEach(() => {
    if (existsSync(typeOutputDirectory)) {
      rmSync(typeOutputDirectory, { recursive: true });
    }
  });

  test('Throw and no index file', async () => {
    await expect(
      convertFromDirectory({
        schemaDirectory: './src/__tests__/empty/schemas',
        typeOutputDirectory
      })
    ).rejects.toThrowError();

    expect(existsSync(`${typeOutputDirectory}/index.ts`)).toBeFalsy();
  });
});
