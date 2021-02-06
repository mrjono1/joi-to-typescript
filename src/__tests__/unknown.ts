import Joi from 'joi';

import { convertSchema } from '../index';

describe('test `Joi.unknown()`', () => {
  test('`unknown(true)`', () => {
    const schema = Joi.object({
      name: Joi.string()
    })
      .label('TestSchema')
      .description('a test schema definition')
      .unknown(true);

    const result = convertSchema({ sortPropertiesByName: false }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface TestSchema {
  name?: string;
  /**
   * Unknown Property
   */
  [x: string]: any;
}`);
  });

  test('`unknown(false)`', () => {
    const schema2 = Joi.object({
      name: Joi.string()
    })
      .label('TestSchema')
      .description('a test schema definition')
      .unknown(false);

    const result2 = convertSchema({}, schema2);
    expect(result2).not.toBeUndefined;
    expect(result2?.content).toBe(`/**
 * a test schema definition
 */
export interface TestSchema {
  name?: string;
}`);
  });
});
