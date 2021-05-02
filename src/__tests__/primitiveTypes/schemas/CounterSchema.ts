import Joi from "joi";

export const CounterSchema = Joi.number()
  .label('Counter');

export const CompanySchema = Joi.object({
  counter: CounterSchema
});

export const UserSchema = Joi.object({
  counter: CounterSchema.required()
});
