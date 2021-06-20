import Joi from 'joi';

export const nestedSchema = Joi.object({
  name: Joi.string().optional(),
  address: Joi.object({
    line1: Joi.string().required(),
    line2: Joi.string().optional(),
    suburb: Joi.string().required()
  }),
  connections: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      type: Joi.array().items(Joi.string()),
      frogs: Joi.array().items(
        Joi.object({ colour: Joi.string().required(), legs: Joi.object({ toe: Joi.number().required() }) })
      )
    })
  )
}).meta({ className: 'Nested' });
