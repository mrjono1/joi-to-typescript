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
