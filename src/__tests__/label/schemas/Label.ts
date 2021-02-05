import Joi from 'joi';

export const label = Joi.object({
  name: Joi.string()
}).label('Frank');
