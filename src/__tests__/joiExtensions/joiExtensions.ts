import Joi from 'joi';
import { convertSchema } from '../..';

// Add a couple of extensions to Joi, one without specifying the base type
const ExtendedJoi = Joi.extend(joi => {
  const ext: Joi.Extension = {
    type: 'objectId',
    base: joi.string().meta({ baseType: 'string' })
  };
  return ext;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}).extend((joi: any) => {
  const ext: Joi.Extension = {
    type: 'dollars',
    base: joi.number()
  };
  return ext;
});

describe('Joi Extensions', () => {
  test('An extended type with baseType set in metadata', () => {
    const schema = Joi.object({
      doStuff: ExtendedJoi.objectId()
    }).meta({ className: 'Test' });

    const result = convertSchema({ debug: true }, schema);
    expect(result).not.toBeUndefined;
    // prettier-ignore
    expect(result?.content).toBe(
       [
         'export interface Test {',
         '  doStuff?: string;',
         '}'
       ].join('\n')
     );
  });

  test('An extended type with baseType not set in metadata', () => {
    const schema = Joi.object({
      doStuff: ExtendedJoi.dollars()
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
});
