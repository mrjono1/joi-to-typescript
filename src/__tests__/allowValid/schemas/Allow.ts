import Joi from 'joi';

export const roleSchema = Joi.string().allow('Admin', 'User').meta({ className: 'AllowRole' });

export const userSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: roleSchema.required()
}).meta({ className: 'AllowUser' });
