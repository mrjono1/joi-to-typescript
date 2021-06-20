import Joi from 'joi';

export const Name = Joi.string().meta({ className: 'Name' });

export const EmailAddress = Joi.string().email().meta({ className: 'Email Address' });

export const CustomerPhoneNumber = Joi.string().meta({ className: 'Customer Phone Number' });

export const spacedClassName = Joi.object({
  name: Name,
  email: EmailAddress,
  phone: CustomerPhoneNumber
});
