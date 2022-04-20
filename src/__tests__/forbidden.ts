import Joi from 'joi';

import { convertSchema } from '../index';

describe('forbidden tests', () => {
  test('enums using allow()', () => {
    const schema = Joi.object({
      bit: Joi.boolean().forbidden(),
      customObject: Joi.object().meta({className: 'CustomObject'}).forbidden()
    })
      .meta({ className: 'TestSchema' })
      .description('a test schema definition');

    const result = convertSchema({ defaultToRequired: true }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`/**
 * a test schema definition
 */
export interface TestSchema {
  bit: undefined;
  customObject: undefined;
}`);
  });
});
