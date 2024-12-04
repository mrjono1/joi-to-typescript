import Joi from 'joi';
import { convertSchema } from '../index';

describe('override tests', () => {
  test("figure out what joi's doing", () => {
    const val = Joi.override;
    expect(val).toBe(Joi.override);
    if (val !== Joi.override) throw 'not equal'; // double checking
  });

  test('control: valid without Joi.override', () => {
    const schema = Joi.object({
      foo: Joi.string().valid('val1', 'val2').valid('val3', 'val4')
    })
      .meta({ className: 'OverrideSchema' })
      .description('a test schema definition');

    const result = convertSchema({ defaultToRequired: true }, schema);
    expect(result).not.toBeUndefined;

    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface OverrideSchema {
  foo: 'val1' | 'val2' | 'val3' | 'val4';
}`);
  });

  test('no error with valid() strings and Joi.override', () => {
    const schema = Joi.object({
      foo: Joi.string().valid('val1', 'val2').valid(Joi.override, 'val3', 'val4')
    })
      .meta({ className: 'OverrideSchema' })
      .description('a test schema definition');

    // shouldn't throw anything
    const result = convertSchema({ defaultToRequired: true }, schema);

    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface OverrideSchema {
  foo: 'val3' | 'val4';
}`);
  });

  test('control: no error with valid() numbers without Joi.override', () => {
    const schema = Joi.object({
      foo: Joi.number().valid(12, 34).valid(56, 78)
    })
      .meta({ className: 'OverrideSchema' })
      .description('a test schema definition');

    const result = convertSchema({ defaultToRequired: true }, schema);

    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface OverrideSchema {
  foo: 12 | 34 | 56 | 78;
}`);
  });

  test('no error with valid() numbers and Joi.override', () => {
    const schema = Joi.object({
      foo: Joi.number().valid(12, 34).valid(Joi.override, 56, 78)
    })
      .meta({ className: 'OverrideSchema' })
      .description('a test schema definition');

    const result = convertSchema({ defaultToRequired: true }, schema);

    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface OverrideSchema {
  foo: 56 | 78;
}`);
  });

  // skipping -- these all fail:
  // original String sends allows (of non strings) to parseStringSchema
  // and then to toStringLiteral
  // details.allow parsing probably needs a more generic approach

  test.skip('[existing bug] control: no error with Joi.string().allow(null).allow(Joi.number())', () => {
    const schema = Joi.object({
      foo: Joi.string().allow(null).allow(Joi.number())
      // same as: .allow(null, Joi.number())
    })
      .meta({ className: 'OverrideSchema' })
      .description('a test schema definition');

    const result = convertSchema({ defaultToRequired: true }, schema);

    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface OverrideSchema {
  foo: string | null | number;
}`);
  });

  test.skip('[existing bug] no error with Joi.string().allow(null).allow(Joi.override, Joi.number())', () => {
    const schema = Joi.object({
      foo: Joi.string().allow(null).allow(Joi.override, Joi.number())
    })
      .meta({ className: 'OverrideSchema' })
      .description('a test schema definition');

    const result = convertSchema({ defaultToRequired: true }, schema);

    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface OverrideSchema {
  foo: string | number;
}`);
  });

  test.skip('[not implemented] no error with any().invalid(Joi.string())', () => {
    const schema = Joi.object({
      foo: Joi.any().invalid(Joi.string())
      // .invalid( Joi.string() ).invalid( Joi.number() )
    })
      .meta({ className: 'OverrideSchema' })
      .description('a test schema definition');

    const result = convertSchema({ defaultToRequired: true }, schema);

    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface OverrideSchema {
  foo: Omit<any, string>;
}`);
  });

  test.skip('[not implemented] no error with any().invalid(string).invalid(Joi.override, number)', () => {
    const schema = Joi.object({
      foo: Joi.any().invalid(Joi.string()).invalid(Joi.override, Joi.number())
    })
      .meta({ className: 'OverrideSchema' })
      .description('a test schema definition');

    const result = convertSchema({ defaultToRequired: true }, schema);

    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface OverrideSchema {
  foo: Omit<any, number>;
}`);
  });

  test.skip('[unfinished] try mixing .valid() .allow() .invalid() on one schema', () => {
    throw new Error('not implemented');
  });
});
