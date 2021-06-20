import Joi from 'joi';

export const ItemSchema = Joi.object({
  name: Joi.string().required()
}).meta({ className: 'Item' });

export const TestSchema = Joi.object({
  name: Joi.string().optional(),
  propertyName1: Joi.bool().required(),
  items: Joi.array().items(ItemSchema).optional()
})
  .meta({ className: 'Test' })
  .description('a test schema definition');

export const TestListSchema = Joi.array()
  .items(TestSchema)
  .required()
  .meta({ className: 'TestList' })
  .description('A list of Test object');
