import Joi from 'joi';

export const NumberSchema = Joi.object({
  bool: Joi.boolean().cast('number').required(),
  day: Joi.date().cast('number').required(),
}).meta({ className: 'Numbers' });

export const StringSchema = Joi.object({
  num: Joi.number().cast('string').required()
}).meta({ className: 'Strings' })

export const StringType = Joi.number().cast('string')

export const NumberType = Joi.boolean().cast('number')
