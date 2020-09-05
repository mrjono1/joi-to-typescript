import { convertFromDirectory } from '../index';

test('03.array', async () => {
  const result = await convertFromDirectory({
    schemaDirectory: './src/__tests__/03/schemas',
    interfaceDirectory: './src/__tests__/03/models'
  });

  expect(result).toBe(true);
});
