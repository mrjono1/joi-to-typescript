import Joi from 'joi';

export const TestSchema = Joi.object({
  name: Joi.string().optional()
}).description('a test schema definition');

export const TestWithMetaSchema = Joi.object({
  name: Joi.string().optional()
}).meta({
  myMeta: 'Hello'
});
