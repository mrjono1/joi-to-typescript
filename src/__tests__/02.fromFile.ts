import { convertFromDirectory } from '../index';

test('02.fromFiles', async () => {
  const result = await convertFromDirectory({
    schemaDirectory: './src/__tests__/02/schemas',
    interfaceDirectory: './src/__tests__/02/models'
  });

  expect(result).toBe(true);
});
