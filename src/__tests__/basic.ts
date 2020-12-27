import Joi from 'joi';

import { convertSchema, Settings } from '../index';

describe('some basic tests', () => {
  test('test the base types', () => {
    const schema = Joi.object({
      // basic types
      name: Joi.string()
        .optional()
        .description('Test Schema Name'),
      propertyName1: Joi.boolean().required(),
      dateCreated: Joi.date(),
      count: Joi.number(),
      obj: Joi.object()
    })
      .label('TestSchema')
      .description('a test schema definition');

    const result = convertSchema(({ sortPropertiesByName: true } as unknown) as Settings, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface TestSchema {
  count?: number;
  dateCreated?: Date;
  /**
   * Test Schema Name
   */
  name?: string;
  obj?: object;
  propertyName1: boolean;
}`);
  });

  test('array tests', () => {
    const schemaArray = Joi.object({
      // basic types
      name: Joi.array()
        .items(Joi.string())
        .optional(),
      propertyName1: Joi.array()
        .items(Joi.boolean())
        .required(),
      dateCreated: Joi.array().items(Joi.date()),
      count: Joi.array().items(Joi.number()),
      arr: Joi.array()
    })
      .label('ArrayObject')
      .description('an Array test schema definition');

    const arrayResult = convertSchema(({ sortPropertiesByName: true } as unknown) as Settings, schemaArray);
    expect(arrayResult).not.toBeUndefined;

    expect(arrayResult?.content).toBe(`/**
 * an Array test schema definition
 */
export interface ArrayObject {
  arr?: any[];
  count?: number[];
  dateCreated?: Date[];
  name?: string[];
  propertyName1: boolean[];
}`);
  });

  test('nested types', () => {
    const schema = Joi.object({
      nested: Joi.object({ a: Joi.object({ b: Joi.string() }) }),
      nestedComments: Joi.object({ a: Joi.object({ b: Joi.string().description('nested comment') }) }),
      nestedObject: Joi.object({
        aType: Joi.object()
          .label('Blue')
          .description('A blue object property')
      }),
      'x.y': Joi.string()
    }).label('TestSchema');

    const result = convertSchema(({} as unknown) as Settings, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`export interface TestSchema {
  nested?: {
    a?: {
      b?: string;
    };
  };
  nestedComments?: {
    a?: {
      /**
       * nested comment
       */
      b?: string;
    };
  };
  nestedObject?: {
    /**
     * A blue object property
     */
    aType?: Blue;
  };
  'x.y'?: string;
}`);
  });

  test('Uppercase and lowercase property', () => {
    const schema = Joi.object({
      a: Joi.string(),
      A: Joi.string()
    }).label('TestSchema');

    const result = convertSchema(({} as unknown) as Settings, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`export interface TestSchema {
  a?: string;
  A?: string;
}`);
  });
});
