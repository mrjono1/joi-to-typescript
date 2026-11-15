import Joi from 'joi';

export const TestSchema = Joi.object({
  name: Joi.string().optional(),
  propertyName1: Joi.boolean().required(),
  'yellow.flower': Joi.string()
})
  .meta({ className: 'TestSchema' })
  .description('a test schema definition');

export const purple = (): void => {
  // eslint-disable-next-line no-console
  console.log('this is not a schema');
};
