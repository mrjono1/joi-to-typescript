import Joi from 'joi';

import { convertSchema, Settings } from '../index';

test('06.enums', () => {
  const schema = Joi.object({
    topColour: Joi.string()
      .valid('red', 'green', 'orange', 'blue')
      .required(),
    bottomColour: Joi.string()
      .valid('red', 'green', 'orange', 'blue')
      .required()
  })
    .label('TestSchema')
    .description('a test schema definition');

  const result = convertSchema(({ defaultToRequired: true } as unknown) as Settings, schema);

  expect(result[0].content).toBe(`/**
 * a test schema definition
 */
export interface TestSchema {
  /**
   * bottomColour
   */
  bottomColour: 'red' | 'green' | 'orange' | 'blue';
  /**
   * topColour
   */
  topColour: 'red' | 'green' | 'orange' | 'blue';
}`);
});
