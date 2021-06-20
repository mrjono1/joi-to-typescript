import Joi from 'joi';

export const thingSchema = Joi.object({
  thing: Joi.string().required()
}).meta({ className: 'Thing' });

export const otherSchema = Joi.object({
  other: Joi.string().optional()
}).meta({ className: 'Other' });

export const basicSchema = Joi.alternatives()
  .try(Joi.number(), Joi.string())
  .meta({ className: 'Basic' })
  .description('a description for basic');

export const TestSchema = Joi.object({
  name: Joi.string().optional(),
  value: Joi.alternatives().try(thingSchema, otherSchema),
  basic: basicSchema
})
  .meta({ className: 'Test' })
  .description('a test schema definition');

export const TestListOfAltsSchema = Joi.array()
  .items(Joi.alt().try(Joi.bool(), Joi.string()))
  .required()
  .meta({ className: 'TestList' })
  .description('A list of Test object');
