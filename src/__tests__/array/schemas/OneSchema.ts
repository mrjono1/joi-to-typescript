import Joi from 'joi';

export const ItemSchema = Joi.object({
  name: Joi.string().required()
}).label('Item');

export const TestSchema = Joi.object({
  name: Joi.string().optional(),
  propertyName1: Joi.boolean().required(),
  items: Joi.array()
    .items(ItemSchema)
    .optional()
})
  .label('Test')
  .description('a test schema definition');

export const TestListSchema = Joi.array()
  .items(TestSchema)
  .required()
  .label('TestList')
  .description('A list of Test object');
