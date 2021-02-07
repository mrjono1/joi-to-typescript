import Joi from 'joi';

import { convertSchema } from '../index';

describe('union types using allow()', () => {
  test('many variations of `allow()`', () => {
    // allowing an empty string is still just a string
    const schema = Joi.object({
      name: Joi.string().optional().description('Test Schema Name').allow(''),
      nullName: Joi.string().optional().description('nullable').allow(null),
      blankNull: Joi.string().optional().allow(null, ''),
      normalList: Joi.string().allow('red', 'green', 'blue'),
      normalRequiredList: Joi.string().allow('red', 'green', 'blue').required(),
      numbers: Joi.number().optional().allow(1, 2, 3, 4, 5),
      nullNumber: Joi.number().optional().allow(null),
      date: Joi.date().allow(null).description('This is date')
    })
      .label('TestSchema')
      .description('a test schema definition');

    const result = convertSchema({ sortPropertiesByName: false }, schema);
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
  blankNull?: string | null | '';
  normalList?: 'red' | 'green' | 'blue';
  normalRequiredList: 'red' | 'green' | 'blue';
  numbers?: 1 | 2 | 3 | 4 | 5;
  nullNumber?: number | null;
  /**
   * This is date
   */
  date?: Date | null;
}`);
  });

  test('test an invalid variation of `allow()`', () => {
    expect(() => {
      const invalidSchema = Joi.object({
        blankNullUndefined: Joi.string().optional().allow(null, '', undefined),
        blankNullUndefinedRequired: Joi.string().required().allow(null, '', undefined)
      })
        .label('TestSchema')
        .description('a test schema definition');

      const invalidResult = convertSchema({}, invalidSchema);
      console.log(invalidResult);
    }).toThrow();
  });
});
