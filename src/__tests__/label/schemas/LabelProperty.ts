import Joi from 'joi';

export const Name = Joi.string().label('Name');

export const label = Joi.object({
  name: Name
});
