import Joi from 'joi';

export const NumberSchema = Joi.object({
  bool: Joi.boolean().cast('number').required(),
  day: Joi.date().cast('number').required(),
}).meta({ className: 'Numbers' });

export const StringSchema = Joi.object({
  num: Joi.number().cast('string').required()
}).meta({ className: 'Strings' })
