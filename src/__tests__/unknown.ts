import Joi from 'joi';

import { convertSchema } from '../index';

describe('test `Joi.unknown()`', () => {
  test('`unknown(true)`', () => {
    const schema = Joi.object({
      name: Joi.string()
    })
      .meta({ className: 'TestSchema' })
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
  [x: string]: unknown;
}`);
  });

  test('`unknown(type)`', () => {
    const schema = Joi.object({
      name: Joi.string()
    })
      .meta({ className: 'TestSchema', unknownType: 'number' })
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
   * Number Property
   */
  [x: string]: number;
}`);
  });

  test('`unknown(false)`', () => {
    const schema2 = Joi.object({
      name: Joi.string()
    })
      .meta({ className: 'TestSchema' })
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

  test('`pattern(Joi.string(), Joi.number())`', () => {
    const schema = Joi.object({
      name: Joi.string()
    })
      .meta({ className: 'TestSchema', unknownType: 'number' })
      .description('a test schema definition')
      .pattern(Joi.string(), Joi.number());

    const result = convertSchema({ sortPropertiesByName: false }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface TestSchema {
  name?: string;
  /**
   * Number Property
   */
  [x: string]: number;
}`);
  });

  test('`unknown(true).meta({ unknownType: Joi.AnySchema() })`', () => {
    const schema = Joi.object({})
      .unknown(true)
      .meta({
        className: 'TestSchema',
        unknownType: Joi.array().items(
          Joi.object({
            id: Joi.string().required()
          })
        )
      })
      .description('a test schema definition');

    const result = convertSchema({}, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface TestSchema {
  [x: string]: {
    id: string;
  }[];
}`);
  });

  test('`pattern(Joi.string(), Joi.AnySchema())`', () => {
    const unknownTypeSchema = Joi.array().items(Joi.object({ id: Joi.string().required() }));

    const schema = Joi.object({})
      .pattern(Joi.string(), unknownTypeSchema)
      .meta({ className: 'TestSchema', unknownType: unknownTypeSchema })
      .description('a test schema definition');

    const result = convertSchema({}, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface TestSchema {
  [x: string]: {
    id: string;
  }[];
}`);
  });
});
