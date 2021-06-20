import Joi from 'joi';

export const PersonSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required()
}).meta({ className: 'Person' });
