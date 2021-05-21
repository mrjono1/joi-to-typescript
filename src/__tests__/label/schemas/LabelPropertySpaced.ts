import Joi from 'joi';

export const Name = Joi.string().label('Name');

export const EmailAddress = Joi.string().email().label('Email Address');

export const spacedLabel = Joi.object({
  name: Name,
  email: EmailAddress
});
