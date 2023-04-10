import Joi from 'joi';

import { convertSchema } from '../index';

describe('readonly tests', () => {
  test('readonly', () => {
    const schema = Joi.object({
      bit: Joi.boolean().meta({ readonly: true }),
      customObject: Joi.boolean().meta({ readonly: true, className: 'CustomObject' })
      // readonly on a top level object is ignored
    }).meta({ className: 'TestSchema', readonly: true });

    const result = convertSchema({ defaultToRequired: true }, schema);
    expect(result).not.toBeUndefined;
    expect(result?.content).toBe(`export interface TestSchema {
  readonly bit: boolean;
  readonly customObject: CustomObject;
}`);
  });
});
