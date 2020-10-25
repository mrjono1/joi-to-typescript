import Joi from 'joi';

import { convertSchema, Settings } from '../index';

test('07.alternatives', () => {
  const schema = Joi.alternatives()
    .try(Joi.number(), Joi.string())
    .label('TestSchema')
    .description('a test schema definition');

  const result = convertSchema(({ defaultToRequired: true } as unknown) as Settings, schema);

  expect(result[0].content).toBe(`/**
 * a test schema definition
 */
export type TestSchema = number | string;
`);
});
