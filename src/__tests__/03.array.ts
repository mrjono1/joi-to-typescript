import { convertFromDirectory } from '../index';

test('03.array', async () => {
  const result = await convertFromDirectory('./src/__tests__/03/schemas', './src/__tests__/03/models');

  expect(result).toBe(true);
});
