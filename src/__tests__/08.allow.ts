import Joi from 'joi';

import { convertSchema, Settings } from '../index';

test('08.allow', () => {
  // allowing an empty string is still just a string
  const schema = Joi.object({
    name: Joi.string()
      .optional()
      .description('Test Schema Name')
      .allow(''),
    nullName: Joi.string()
      .optional()
      .description('nullable')
      .allow(null),
    blankNull: Joi.string()
      .optional()
      .allow(null, ''),
    normalList: Joi.string().allow('red', 'green', 'blue'),
    normalRequiredList: Joi.string()
      .allow('red', 'green', 'blue')
      .required()
  })
    .label('TestSchema')
    .description('a test schema definition');

  const result = convertSchema(({} as unknown) as Settings, schema);
  expect(result).not.toBeUndefined;
  expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface TestSchema {
  /**
   * Test Schema Name
   */
  name?: string;
  /**
   * nullable
   */
  nullName?: string | null;
  /**
   * blankNull
   */
  blankNull?: string | null | '';
  /**
   * normalList
   */
  normalList?: 'red' | 'green' | 'blue';
  /**
   * normalRequiredList
   */
  normalRequiredList: 'red' | 'green' | 'blue';
}`);

  expect(() => {
    const invalidSchema = Joi.object({
      blankNullUndefined: Joi.string()
        .optional()
        .allow(null, '', undefined),
      blankNullUndefinedRequired: Joi.string()
        .required()
        .allow(null, '', undefined)
    })
      .label('TestSchema')
      .description('a test schema definition');

    const invalidResult = convertSchema(({} as unknown) as Settings, invalidSchema);
    console.log(invalidResult);
  }).toThrow();
});
