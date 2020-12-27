import { convertFromDirectory } from '../../index';

describe('empty schema directory', () => {
  test('Throw if no schemas are found ', async () => {
    expect(async () => {
      await convertFromDirectory({
        schemaDirectory: './src/__tests__/none/schemas',
        typeOutputDirectory: './src/__tests__/none/models'
      });
    }).rejects.toThrowError();
  });
});
