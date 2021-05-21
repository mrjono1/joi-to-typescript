import Joi from 'joi';

export const Name = Joi.string().label('Name');

export const EmailAddress = Joi.string().email().label('Email Address');

export const CustomerPhoneNumber = Joi.string().label('Customer Phone Number');

export const spacedLabel = Joi.object({
  name: Name,
  email: EmailAddress,
  phone: CustomerPhoneNumber
});
