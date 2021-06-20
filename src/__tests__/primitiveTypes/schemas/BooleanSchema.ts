import Joi from 'joi';

export const BooleanSchema = Joi.boolean().meta({ className: 'Boolean' });

export const CompanySchema = Joi.object({
  counter: BooleanSchema
});

export const UserSchema = Joi.object({
  counter: BooleanSchema.required()
});
