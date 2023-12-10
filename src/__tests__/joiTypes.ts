import Joi from 'joi';
import { convertSchema } from '..';

// if I called this file just `types.ts` the vscode debugger ran all tests no just this file

// If this test fails it could mean there is breaking changes in Joi
describe('`Joi.types()`', () => {
  test('list of types', () => {
    const types = Joi.types();

    const listOfTypes = [
      'alternatives', // Basic support
      'any', // Supported
      'array', // Supported
      'boolean', // Supported
      'date', // Supported
      'function', // Basic Support
      'link', // Not Supported - Might be possible
      'number', // Supported
      'object', // Supported
      'string', // Supported
      'symbol', // Not Supported - Might be possible
      'binary', // Not Supported - Should be supported
      'alt', // Supported
      'bool', // Supported
      'func' // Not Supported
    ];

    // Joi.bool an Joi.boolean both output as 'boolean'
    // Joi.alt and Joi.alternatives both output as 'alternatives'
    expect(Object.keys(types)).toMatchObject(listOfTypes);
  });

  test('Joi.function()', () => {
    const schema = Joi.object({
      doStuff: Joi.function(),
      stuff: Joi.function().required(),
      moreThings: Joi.func()
    }).meta({ className: 'Test' });

    const result = convertSchema({ debug: true }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(
      [
        'export interface Test {',
        '  doStuff?: ((...args: any[]) => any);',
        '  moreThings?: ((...args: any[]) => any);',
        '  stuff: ((...args: any[]) => any);',
        '}'
      ].join('\n')
    );
  });

  test('Joi.function() bare value', () => {
    const schema = Joi.function().meta({ className: 'Test' });

    const result = convertSchema({ debug: true }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(['export type Test = (...args: any[]) => any;'].join('\n'));
  });

  // TODO: It might be possible to support link
  // I guess this would find the referenced schema and get its type
  test('Joi.link()', () => {
    const schema = Joi.object({
      doStuff: Joi.link()
    }).meta({ className: 'Test' });

    const result = convertSchema({ debug: true }, schema);
    expect(result).not.toBeUndefined;
    // prettier-ignore
    expect(result?.content).toBe(
      [
        'export interface Test {',
        '  doStuff?: unknown;',
        '}'
      ].join('\n')
    );
  });

  test('Joi.symbol()', () => {
    const schema = Joi.object({
      doStuff: Joi.symbol()
    }).meta({ className: 'Test' });

    const result = convertSchema({ debug: true }, schema);
    expect(result).not.toBeUndefined;
    // prettier-ignore
    expect(result?.content).toBe(
      [
        'export interface Test {',
        '  doStuff?: symbol;',
        '}'
      ].join('\n')
    );
  });

  // TODO: Support Binary
  test('Joi.binary()', () => {
    const schema = Joi.object({
      doStuff: Joi.binary()
    }).meta({ className: 'Test' });

    const result = convertSchema({ debug: true }, schema);
    expect(result).not.toBeUndefined;
    // prettier-ignore
    expect(result?.content).toBe(
      [
        'export interface Test {',
        '  doStuff?: Buffer;',
        '}'
      ].join('\n')
    );
  });
});
