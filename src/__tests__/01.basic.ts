import Joi from 'joi';

import { convertObject } from '../index';

test('basic', () => {
  const schema = Joi.object({
    name: Joi.string().optional(),
    propertyName1: Joi.boolean().required()
  })
    .label('TestSchema')
    .description('a test schema definition');

  const result = convertObject(schema);

  expect(result[0].content).toBe(`/**
 * TestSchema
 * a test schema definition
 */
export interface TestSchema {
  /**
   * name
   */
  name?: string;
  /**
   * propertyName1
   */
  propertyName1: boolean;
}`);
});
