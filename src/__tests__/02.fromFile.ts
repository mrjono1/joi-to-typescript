import { convertFromDirectory } from '../index';

test('02.fromFiles', async () => {
  const result = await convertFromDirectory('./src/__tests__/02/schemas', './src/__tests__/02/models');

  expect(result).toBe(true);
});
