import Joi from 'joi';

import { convertSchema } from '../index';

test('01.basic', () => {
  const schema = Joi.object({
    // basic types
    name: Joi.string().optional(),
    propertyName1: Joi.boolean().required(),
    dateCreated: Joi.date(),
    count: Joi.number()
  })
    .label('TestSchema')
    .description('a test schema definition');

  const result = convertSchema({}, schema);

  expect(result[0].content).toBe(`/**
 * TestSchema
 * a test schema definition
 */
export interface TestSchema {
  /**
   * count
   */
  count?: number;
  /**
   * dateCreated
   */
  dateCreated?: Date;
  /**
   * name
   */
  name?: string;
  /**
   * propertyName1
   */
  propertyName1: boolean;
}`);

  const schemaArray = Joi.object({
    // basic types
    name: Joi.array()
      .items(Joi.string())
      .optional(),
    propertyName1: Joi.array()
      .items(Joi.boolean())
      .required(),
    dateCreated: Joi.array().items(Joi.date()),
    count: Joi.array().items(Joi.number())
  })
    .label('ArraySchema')
    .description('an Array test schema definition');

  const arrayResult = convertSchema({}, schemaArray);

  expect(arrayResult[0].content).toBe(`/**
 * ArraySchema
 * an Array test schema definition
 */
export interface ArraySchema {
  /**
   * count
   */
  count?: number[];
  /**
   * dateCreated
   */
  dateCreated?: Date[];
  /**
   * name
   */
  name?: string[];
  /**
   * propertyName1
   */
  propertyName1: boolean[];
}`);
});
