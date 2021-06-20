import Joi from 'joi';

export const CounterSchema = Joi.number().meta({ className: 'Counter' });

export const CompanySchema = Joi.object({
  counter: CounterSchema
});

export const UserSchema = Joi.object({
  counter: CounterSchema.required()
});
