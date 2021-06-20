import Joi from 'joi';

export const className = Joi.object({
  name: Joi.string()
}).meta({ className: 'Frank' });
