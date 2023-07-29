import Joi from 'joi';

export const BarSchema = Joi.object({
  id: Joi.number().required().description('Id').example(1)
}).meta({ className: 'Bar' });

export const FooSchema = Joi.object({
  id: Joi.number().required().description('Id').example(1),
  bar: BarSchema.required().description('Bar')
}).meta({ className: 'Foo' });
