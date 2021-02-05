import Joi from 'joi';

export const nolabelSchema = Joi.object({
  name: Joi.string()
});
