import Joi from 'joi';
import { convertSchema } from '..';

// if I called this file just `types.ts` the vscode debugger ran all tests no just this file

// If this test fails it could mean there is breaking changes in Joi
describe('`Joi.types()`', () => {
  test('list of types', () => {
    const types = Joi.types();

    const listOfTypes = [
      'alternatives', // Supported
      'any', // Supported
      'array', // Supported
      'boolean', // Supported
      'date', // Supported
      'function', // Not Supported
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
    const consoleSpy = jest.spyOn(console, 'debug');
    const schema = Joi.object({
      doStuff: Joi.function(),
      moreThings: Joi.func()
    }).label('Test');

    const result = convertSchema({ debug: true }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`export interface Test {}`);
    expect(consoleSpy).toHaveBeenCalledWith('unsupported type: function');
  });

  // TODO: It might be possible to support link
  // I guess this would find the referenced schema and get its type
  test('Joi.link()', () => {
    const consoleSpy = jest.spyOn(console, 'debug');
    const schema = Joi.object({
      doStuff: Joi.link()
    }).label('Test');

    const result = convertSchema({ debug: true }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`export interface Test {}`);
    expect(consoleSpy).toHaveBeenCalledWith('unsupported type: link');
  });

  test('Joi.symbol()', () => {
    const consoleSpy = jest.spyOn(console, 'debug');
    const schema = Joi.object({
      doStuff: Joi.symbol()
    }).label('Test');

    const result = convertSchema({ debug: true }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`export interface Test {}`);
    expect(consoleSpy).toHaveBeenCalledWith('unsupported type: symbol');
  });

  // TODO: Support Binary
  test('Joi.binary()', () => {
    const consoleSpy = jest.spyOn(console, 'debug');
    const schema = Joi.object({
      doStuff: Joi.binary()
    }).label('Test');

    const result = convertSchema({ debug: true }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`export interface Test {}`);
    expect(consoleSpy).toHaveBeenCalledWith('unsupported type: binary');
  });
});
