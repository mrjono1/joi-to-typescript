import Joi from 'joi';

import { convertSchema, Settings } from '../index';

test('basic', () => {
  const schema = Joi.object({
    zebra: Joi.number(),
    name: Joi.string().optional(),
    propertyName1: Joi.boolean().required()
  })
    .label('TestSchema')
    .description('a test schema definition');

  const result = convertSchema(({} as unknown) as Settings, schema);

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
  /**
   * zebra
   */
  zebra?: number;
}`);
});
