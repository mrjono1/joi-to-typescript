import { convertFromDirectory } from '../index';

test('04.multipleFiles', async () => {
  const result = await convertFromDirectory({
    schemaDirectory: './src/__tests__/04/schemas',
    interfaceDirectory: './src/__tests__/04/models'
  });

  expect(result).toBe(true);
});
