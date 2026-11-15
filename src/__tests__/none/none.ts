import { existsSync, rmSync } from 'fs';
import { convertFromDirectory } from '../../index';

describe('no schemas in directory', () => {
  const typeOutputDirectory = './src/__tests__/none/interfaces';

  beforeEach(() => {
    if (existsSync(typeOutputDirectory)) {
      rmSync(typeOutputDirectory, { recursive: true });
    }
  });

  test('Throw and no index file', async () => {
    await expect(
      convertFromDirectory({
        schemaDirectory: './src/__tests__/none/schemas',
        typeOutputDirectory
      })
    ).rejects.toThrowError();

    expect(existsSync(`${typeOutputDirectory}/index.ts`)).toBeFalsy();
  });
});
