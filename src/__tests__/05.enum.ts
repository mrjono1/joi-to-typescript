import Joi from 'joi';

import { convertSchema, Settings } from '../index';

test('05.enums', () => {
  const schema = Joi.object({
    topColour: Joi.string()
      .valid('red', 'green', 'orange', 'blue')
      .required(),
    bottomColour: Joi.string()
      .valid('red', 'green', 'orange', 'blue')
      .required(),
    bit: Joi.boolean().allow(0, 1, '0', '1', null)
  })
    .label('TestSchema')
    .description('a test schema definition');

  const result = convertSchema(({ defaultToRequired: true } as unknown) as Settings, schema);
  expect(result).not.toBeUndefined;
  expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface TestSchema {
  topColour: 'red' | 'green' | 'orange' | 'blue';
  bottomColour: 'red' | 'green' | 'orange' | 'blue';
  bit: 0 | 1 | '0' | '1' | null;
}`);
});
