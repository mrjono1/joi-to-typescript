import Joi from 'joi';

export const thingSchema = Joi.object({
  thing: Joi.string().required()
}).label('Thing');

export const otherSchema = Joi.object({
  other: Joi.string().optional()
}).label('Other');

export const basicSchema = Joi.alternatives()
  .try(Joi.number(), Joi.string())
  .label('Basic')
  .description('a test schema definition');

export const TestSchema = Joi.object({
  name: Joi.string().optional(),
  value: Joi.alternatives().try(thingSchema, otherSchema),
  basic: basicSchema
})
  .label('Test')
  .description('a test schema definition');

export const TestListOfAltsSchema = Joi.array()
  .items(Joi.alternatives().try(Joi.bool(), Joi.string()))
  .required()
  .label('TestList')
  .description('A list of Test object');
