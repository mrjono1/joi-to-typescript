import Joi from 'joi';

export const BarSchema = Joi.object({
  id: Joi.number()
    .required()
    .description('Id')
    .example(1)
}).label('Bar');

export const FooSchema = Joi.object({
  id: Joi.number()
    .required()
    .description('Id')
    .example(1),
  bar: BarSchema.required().description('Bar')
}).label('Foo');
