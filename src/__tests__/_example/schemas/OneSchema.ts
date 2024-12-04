import Joi from 'joi';

export const exampleSchema = Joi.object({
  thing: Joi.string().required()
}).meta({ className: 'Example' });
