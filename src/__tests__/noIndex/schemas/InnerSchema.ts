import Joi from 'joi';

export const InnerSchema = Joi.object({
  hello: Joi.string()
}).meta({ className: 'InnerInterface' });
