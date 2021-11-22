import Joi from 'joi';

export const FooSchema = Joi.object({
  a: Joi.string()
}).meta({ className: 'Foo' });

export const BarSchema = Joi.object({
  b: Joi.string()
}).meta({ className: 'Bar' });

export const FooBarSchema = FooSchema.concat(BarSchema).meta({ className: 'FooBar' });
