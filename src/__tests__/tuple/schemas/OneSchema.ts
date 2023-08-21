import Joi from 'joi';

export const ItemSchema = Joi.object({
  name: Joi.string().required()
}).meta({ className: 'Item' });

export const TestSchema = Joi.object({
  name: Joi.string().optional(),
  propertyName1: Joi.bool().required(),
  items: Joi.array().ordered(Joi.number().required()).ordered(Joi.string().required()).ordered(ItemSchema).allow(null)
})
  .meta({ className: 'Test' })
  .description('a test schema definition');

export const TestTupleSchema = Joi.array()
  .ordered(TestSchema.required())
  .ordered(Joi.alternatives(Joi.number(), Joi.string()))
  .meta({ className: 'TestTuple' })
  .description('A tuple of Test object');
