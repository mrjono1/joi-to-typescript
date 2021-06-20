import Joi from 'joi';

export const DateFieldSchema = Joi.date().meta({ className: 'DateField' });

export const CompanySchema = Joi.object({
  counter: DateFieldSchema
});

export const UserSchema = Joi.object({
  counter: DateFieldSchema.required()
});
