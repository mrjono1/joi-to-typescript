import Joi from 'joi';

export const exampleSchema = Joi.object({
  thing: Joi.string().required()
})
  .meta({ className: 'Example' })
  .description('A simple description');

export const exampleLongSchema = Joi.object({
  another: Joi.string().required()
}).meta({ className: 'ExampleLong' }).description(`
This is a long description.
There are many lines!

And more here!
`);

export const noCommentSchema = Joi.object({
  more: Joi.string().required()
}).meta({ className: 'NoComment' });
