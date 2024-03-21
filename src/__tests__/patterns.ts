import Joi from 'joi';

import { convertSchema } from '../index';

describe('test `Joi.object().pattern()`', () => {
  test('`pattern(Joi.string(), Joi.AnySchema())`', () => {
    const schema = Joi.object()
      .pattern(Joi.string(), Joi.array().items(Joi.object({
        id: Joi.string().required(),
        propertyName1: Joi.boolean().required()
      })))
      .description('a test pattern schema definition');

    const result = convertSchema({}, schema, 'TestSchema');
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test pattern schema definition
 */
export interface TestSchema {
  [pattern: string]: {
    id: string;
    propertyName1: boolean;
  }[];
}`);
  });

  test('`pattern(Joi.string(), Joi.number())`', () => {
    const schema = Joi.object()
      .description('a test deep pattern schema definition')
      .pattern(Joi.string(), Joi.number().description('Number Property'));

    const result = convertSchema({}, schema, 'TestSchema');
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test deep pattern schema definition
 */
export interface TestSchema {
  /**
   * Number Property
   */
  [pattern: string]: number;
}`);
  });

  test('`pattern(/^test$/, Joi.AnySchema())`', () => {
    const schema = Joi.object({
      name: Joi.string(),
    })
      .description('a test regex pattern schema definition')
      .pattern(Joi.string(), {
        name: Joi.string().optional(),
        propertyName1: Joi.object().pattern(/^test$/, Joi.object({
          propertyName2: Joi.boolean()
        })).required()
      });

    const result = convertSchema({ sortPropertiesByName: false }, schema, 'TestSchema');
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test regex pattern schema definition
 */
export interface TestSchema {
  name?: string;
  [pattern: string]: {
    name?: string;
    propertyName1: {
      [pattern: string]: {
        propertyName2?: boolean;
      };
    };
  };
}`);
  });
});
