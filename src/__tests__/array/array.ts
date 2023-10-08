import { existsSync, readFileSync, rmdirSync } from 'fs';
import Joi from 'joi';

import { convertFromDirectory, convertSchema } from '../../index';
import { SparseTestListSchema } from './schemas/OneSparseSchema';

describe('Array types', () => {
  const typeOutputDirectory = './src/__tests__/array/interfaces';

  beforeAll(() => {
    if (existsSync(typeOutputDirectory)) {
      rmdirSync(typeOutputDirectory, { recursive: true });
    }
  });

  test('array variations from file', async () => {
    const result = await convertFromDirectory({
      schemaDirectory: './src/__tests__/array/schemas',
      typeOutputDirectory
    });

    expect(result).toBe(true);

    const oneContent = readFileSync(`${typeOutputDirectory}/One.ts`).toString();

    expect(oneContent).toBe(
      `/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface Item {
  name: string;
}

/**
 * a test schema definition
 */
export interface Test {
  items?: Item[];
  name?: string;
  propertyName1: boolean;
}

/**
 * A list of Test object
 */
export type TestList = Test[];
`
    );
  });

  test('test to ensure second items() is ignored', () => {
    // this tests this code
    //const childrenContent = children.map(child => typeContentToTsHelper(settings, child, indentLevel));
    //if (childrenContent.length > 1) {
    //  /* istanbul ignore next */
    //  throw new Error('Multiple array item types not supported');
    //}
    const schema = Joi.array()
      .items(Joi.string().description('one'))
      .items(Joi.number().description('two'))
      .required()
      .meta({ className: 'TestList' })
      .description('A list of Test object');

    const result = convertSchema({ sortPropertiesByName: true }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * A list of Test object
 */
export type TestList = string[];`);
  });

  test('test to ensure sparse arrays have undefined as a possible type', () => {
    // this tests this code
    // if (isSparse) {
    //   return makeTypeContentRoot({
    //     joinOperation: 'list',
    //     children: [
    //       makeTypeContentRoot({
    //         joinOperation: 'union',
    //         children: [child, makeTypeContentChild({ content: 'undefined' })],
    //         interfaceOrTypeName,
    //         jsDoc
    //       })
    //     ],
    //     interfaceOrTypeName,
    //     jsDoc
    //   });
    // }
    const result = convertSchema({ sortPropertiesByName: true }, SparseTestListSchema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * A sparse list of Item object
 */
export type SparseTestList = (Item | undefined)[];`);
  });
});
