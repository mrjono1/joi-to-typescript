import Joi from 'joi';

export const childSchema = Joi.object({
  item: Joi.number().required().example(0)
}).meta({ className: 'Child' });

export const parentSchema = Joi.object({
  child: childSchema.allow(null).required()
}).meta({ className: 'Parent' });
