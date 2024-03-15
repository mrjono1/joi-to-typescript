import Joi from 'joi';

import { convertSchema } from '../../index';

describe('Test behaviour for optional fields with supplied defaults', function () {
  // A junk schema which tests a combination of values and defaults
  const schema = Joi.object({
    str: Joi.string().default('Test'),
    strWithSpecialChars: Joi.string().default('Test\\World$Hello🚀Hey\nYay'),
    num: Joi.number().default(1),
    bool: Joi.boolean().default(true),
    arr: Joi.array().items(Joi.number()).default([1, 2, 3]),
    arr2: Joi.array().items(Joi.string()).default(['X', 'Y', 'Z']),
    alt: Joi.alternatives().try(Joi.string(), Joi.number()).default('Test'),
    obj: Joi.object({
      val: Joi.string()
    }).default({
      val: 'Test'
    }),
    alt2: Joi.alternatives()
      .try(Joi.string(), Joi.number(), Joi.object({ val: Joi.boolean().default(true) }))
      .default({ val: false }),
    strOptional: Joi.string().default('Test').optional(),
    numOptional: Joi.number().default(1).optional(),
    boolOptional: Joi.boolean().default(true).optional()
  });

  it('Test defaults as optional and excluded from types', function () {
    const converted = convertSchema(
      { supplyDefaultsInType: false, treatDefaultedOptionalAsRequired: false },
      schema,
      'Test'
    );
    expect(converted).toBeDefined();
    expect(converted?.content).toEqual(`export interface Test {
  alt?: string | number;
  alt2?: string | number | {
      val?: boolean;
    };
  arr?: number[];
  arr2?: string[];
  bool?: boolean;
  boolOptional?: boolean;
  num?: number;
  numOptional?: number;
  obj?: {
    val?: string;
  };
  str?: string;
  strOptional?: string;
  strWithSpecialChars?: string;
}`);
  });
  it('Test defaults as required and excluded from types', function () {
    const converted = convertSchema(
      { supplyDefaultsInType: false, treatDefaultedOptionalAsRequired: true },
      schema,
      'Test'
    );

    // Should be considered a valid schema
    expect(converted).toBeDefined();

    expect(converted?.content).toEqual(`export interface Test {
  alt: string | number;
  alt2: string | number | {
      val: boolean;
    };
  arr: number[];
  arr2: string[];
  bool: boolean;
  boolOptional?: boolean;
  num: number;
  numOptional?: number;
  obj: {
    val?: string;
  };
  str: string;
  strOptional?: string;
  strWithSpecialChars: string;
}`);
  });
  it('Test defaults as optional and included in types', function () {
    const converted = convertSchema(
      { supplyDefaultsInType: true, treatDefaultedOptionalAsRequired: false },
      schema,
      'Test'
    );
    expect(converted).toBeDefined();
    expect(converted?.content).toEqual(`export interface Test {
  alt?: "Test" | string | number;
  alt2?: {"val":false} | string | number | ({
      val?: true | boolean;
    });
  arr?: [1,2,3] | number[];
  arr2?: ["X","Y","Z"] | string[];
  bool?: true | boolean;
  boolOptional?: true | boolean;
  num?: 1 | number;
  numOptional?: 1 | number;
  obj?: {"val":"Test"} | {
    val?: string;
  };
  str?: "Test" | string;
  strOptional?: "Test" | string;
  strWithSpecialChars?: "Test\\\\World$Hello🚀Hey\\nYay" | string;
}`);
  });
  it('Test defaults as required and included in types', function () {
    const converted = convertSchema(
      { supplyDefaultsInType: true, treatDefaultedOptionalAsRequired: true },
      schema,
      'Test'
    );
    expect(converted).toBeDefined();
    expect(converted?.content).toEqual(`export interface Test {
  alt: "Test" | string | number;
  alt2: {"val":false} | string | number | ({
      val: true | boolean;
    });
  arr: [1,2,3] | number[];
  arr2: ["X","Y","Z"] | string[];
  bool: true | boolean;
  boolOptional?: true | boolean;
  num: 1 | number;
  numOptional?: 1 | number;
  obj: {"val":"Test"} | {
    val?: string;
  };
  str: "Test" | string;
  strOptional?: "Test" | string;
  strWithSpecialChars: "Test\\\\World$Hello🚀Hey\\nYay" | string;
}`);
  });
  it('Test defaults when using the empty default constructor', function () {
    const converted = convertSchema(
      { supplyDefaultsInType: true, treatDefaultedOptionalAsRequired: true },
      Joi.object({
        str: Joi.string().default('Test'),
        strWithSpecialChars: Joi.string().default('Test\\World$Hello🚀Hey\nYay'),
        num: Joi.number().default(1)
      }).default(),
      'Test'
    );
    expect(converted).toBeDefined();
    expect(converted?.content).toEqual(`export interface Test {
  num: 1 | number;
  str: "Test" | string;
  strWithSpecialChars: "Test\\\\World$Hello🚀Hey\\nYay" | string;
}`);
  });
  it('Test defaults when using the empty default constructor (user-provided value)', function () {
    const converted = convertSchema(
      { supplyDefaultsInType: true, treatDefaultedOptionalAsRequired: true },
      Joi.object({
        special: Joi.string()
      }).default({ special: 'deep' }),
      'Test'
    );
    expect(converted).toBeDefined();
    expect(converted?.content).toEqual(`export interface Test {
  special?: string;
}`);
  });
  it('Test defaults when using an user-provided value', function () {
    const converted = convertSchema(
      { supplyDefaultsInType: true, treatDefaultedOptionalAsRequired: true },
      Joi.object({
        something: Joi.string()
      }).default({ something: 'deep' }),
      'Test'
    );
    expect(converted).toBeDefined();
    expect(converted?.content).toEqual(`export type Test = {"something":"deep"} | {
  something?: string;
}`);
  });
  it('Adds defaults to docs', function () {
    const converted = convertSchema(
      { supplyDefaultsInJsDoc: true },
      schema.append({
        fieldWithDoc: Joi.string().description('A field with a\nmultiline doc').default('My string!'),
        fieldWithAnyNull: Joi.any().default(null),
        fieldWithMultilineString: Joi.string().default(`A multiline\nstring with\nsome lines`),
        fieldWithBigDefault: Joi.array()
          .items(Joi.string())
          .default(['i', 'have', 'more', 'than', '5', 'values', 'more', 'more', 'more'])
      }),
      'Test'
    );
    expect(converted).toBeDefined();
    expect(converted?.content).toEqual(`export interface Test {
  /**
   * @default 'Test'
   */
  alt?: string | number;
  /**
   * @default { val: false }
   */
  alt2?: string | number | {
      /**
       * @default true
       */
      val?: boolean;
    };
  /**
   * @default [ 1, 2, 3 ]
   */
  arr?: number[];
  /**
   * @default [ 'X', 'Y', 'Z' ]
   */
  arr2?: string[];
  /**
   * @default true
   */
  bool?: boolean;
  /**
   * @default true
   */
  boolOptional?: boolean;
  /**
   * @default null
   */
  fieldWithAnyNull?: any;
  /**
   * @default
   * [
   *   'i',    'have',
   *   'more', 'than',
   *   '5',    'values',
   *   'more', 'more',
   *   'more'
   * ]
   */
  fieldWithBigDefault?: string[];
  /**
   * A field with a
   * multiline doc
   *
   * @default 'My string!'
   */
  fieldWithDoc?: string;
  /**
   * @default 'A multiline\\nstring with\\nsome lines'
   */
  fieldWithMultilineString?: string;
  /**
   * @default 1
   */
  num?: number;
  /**
   * @default 1
   */
  numOptional?: number;
  /**
   * @default { val: 'Test' }
   */
  obj?: {
    val?: string;
  };
  /**
   * @default 'Test'
   */
  str?: string;
  /**
   * @default 'Test'
   */
  strOptional?: string;
  /**
   * @default 'Test\\\\World$Hello🚀Hey\\nYay'
   */
  strWithSpecialChars?: string;
}`);
  });
});
