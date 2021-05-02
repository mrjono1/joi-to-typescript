import Joi from 'joi';

export const UnionSchema = Joi.alternatives([Joi.string(), Joi.number()]).label('Union');

export const CompanySchema = Joi.object({
  counter: UnionSchema
});

export const UserSchema = Joi.object({
  counter: UnionSchema.required()
});
