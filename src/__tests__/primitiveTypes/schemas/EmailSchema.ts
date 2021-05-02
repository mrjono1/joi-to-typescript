import Joi from 'joi';

export const EmailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .label('Email');

export const CompanySchema = Joi.object({
  email: EmailSchema
});

export const UserSchema = Joi.object({
  email: EmailSchema.required()
});
