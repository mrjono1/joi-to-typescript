import Joi from 'joi';

export const Name = Joi.string().meta({ className: 'Name' });

export const className = Joi.object({
  name: Name
});
