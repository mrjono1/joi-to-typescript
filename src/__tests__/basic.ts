import Joi from 'joi';

import { convertSchema } from '../index';

describe('some basic tests', () => {
  test('test the base types', () => {
    const schema = Joi.object({
      // basic types
      name: Joi.string().optional().description('Test Schema Name'),
      propertyName1: Joi.boolean().required(),
      dateCreated: Joi.date(),
      count: Joi.number(),
      obj: Joi.object()
    })
      .meta({ className: 'Test' })
      .description('a test schema definition');

    const result = convertSchema({}, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface Test {
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
      name: Joi.array().items(Joi.string()).optional(),
      propertyName1: Joi.array().items(Joi.boolean()).required(),
      dateCreated: Joi.array().items(Joi.date()),
      count: Joi.array().items(Joi.number()),
      arr: Joi.array()
    })
      .meta({ className: 'ArrayObject' })
      .description('an Array test schema definition');

    const arrayResult = convertSchema({ sortPropertiesByName: true }, schemaArray);
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
        aType: Joi.object().meta({ className: 'Blue' }).description('A blue object property')
      }),
      'x.y': Joi.string()
    }).meta({ className: 'Test' });

    const result = convertSchema({ sortPropertiesByName: false }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`export interface Test {
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
    }).meta({ className: 'Test' });

    const result = convertSchema({ sortPropertiesByName: false }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`export interface Test {
  a?: string;
  A?: string;
}`);
  });

  test('no properties on a schema', () => {
    const schema = Joi.object({}).meta({ className: 'Test' });

    const result = convertSchema({}, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`export interface Test {}`);
  });

  describe('empty object', () => {
    test('empty object ts generation', () => {
      const schema = Joi.object({
        field1: Joi.string(),
        // Raw empty object
        nothing1: {},
        // Joi should allow any key/pair value here, as per docs: https://joi.dev/api/?v=17.9.1#object
        // "Defaults to allowing any child key."
        nothing2: Joi.object(),
        // In this case we forcefully communicate this is a EMPTY object.
        nothing3: Joi.object({}),
        nothingAppend: Joi.object().append({ hello: Joi.string() }),
        allowUnknown1: Joi.object().unknown(true),
        allowUnknown2: Joi.object({}).unknown(true),
        appended: Joi.object({}).append({ field1: Joi.string() }),
        nothingAlternative: Joi.alternatives([Joi.object({}), Joi.object()])
      }).meta({ className: 'Test' });

      const result = convertSchema({ sortPropertiesByName: false }, schema);
      expect(result).not.toBeUndefined;
      expect(result?.content).toBe(`export interface Test {
  field1?: string;
  nothing1?: Record<string, never>;
  nothing2?: object;
  nothing3?: Record<string, never>;
  nothingAppend?: {
    hello?: string;
  };
  allowUnknown1?: {
    /**
     * Unknown Property
     */
    [x: string]: unknown;
  };
  allowUnknown2?: {
    /**
     * Unknown Property
     */
    [x: string]: unknown;
  };
  appended?: {
    field1?: string;
  };
  nothingAlternative?: Record<string, never> | object;
}`);
    });

    describe('empty object matching', () => {
      const tests: {
        schema: Joi.Schema;
        value: any;
        error?: boolean;
      }[] = [
        {
          schema: Joi.object(),
          value: {},
          error: false
        },
        // When no args are passed, unknown values are allowed by default
        {
          schema: Joi.object(),
          value: {
            hello: 'world'
          },
          error: false
        },
        {
          schema: Joi.object({}),
          value: {},
          error: false
        },
        // When explicitly defining {}, no unknown values are allowed by default
        {
          schema: Joi.object({}),
          value: {
            hello: 'world'
          },
          error: true
        },
        {
          schema: Joi.object().unknown(false),
          value: {},
          error: false
        },
        {
          schema: Joi.object({}).unknown(false),
          value: {},
          error: false
        },
        {
          schema: Joi.object().unknown(false),
          value: {
            hello: 'world'
          },
          // Maybe unexpected but this is how Joi works.
          error: false
        },
        {
          schema: Joi.object({}).unknown(false),
          value: {
            hello: 'world'
          },
          error: true
        },
        {
          schema: Joi.object().unknown(true),
          value: {},
          error: false
        },
        {
          schema: Joi.object().unknown(true),
          value: {
            hello: 'world'
          },
          error: false
        }
      ];

      test.each(tests)('%#', t => {
        const result = t.schema.validate(t.value);
        if (t.error) {
          expect(result.error).not.toBeUndefined();
        } else {
          expect(result.error).toBeUndefined();
        }
      });
    });
  });
});
