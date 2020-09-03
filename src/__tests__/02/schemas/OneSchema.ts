import Joi from 'joi';

export const TestSchema = Joi.object({
  name: Joi.string().optional(),
  propertyName1: Joi.boolean().required()
})
  .label('TestSchema')
  .description('a test schema definition');
