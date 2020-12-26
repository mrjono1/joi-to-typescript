import Joi from 'joi';

export const thingSchema = Joi.object({
  thing: Joi.string().required()
});
