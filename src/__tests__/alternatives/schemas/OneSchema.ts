import Joi from 'joi';

export const thingSchema = Joi.object({
  thing: Joi.string().required()
}).meta({ className: 'Thing' });

export const otherSchema = Joi.object({
  other: Joi.string().optional()
}).meta({ className: 'Other' });

export const basicSchema = Joi.alternatives()
  .try(Joi.number(), Joi.string())
  .meta({ className: 'Basic' })
  .description('a description for basic');

export const TestSchema = Joi.object({
  name: Joi.string().optional(),
  value: Joi.alternatives().try(thingSchema, otherSchema),
  basic: basicSchema
})
  .meta({ className: 'Test' })
  .description('a test schema definition');

export const TestListOfAltsSchema = Joi.array()
  .items(Joi.alt().try(Joi.bool(), Joi.string()))
  .required()
  .meta({ className: 'TestList' })
  .description('A list of Test object');

export const AlternativesConditionalSchema = Joi.object({
  label: Joi.string(),
  someId: Joi.alternatives().conditional('label', {
    is: 'abc',
    then: Joi.string().hex().required().length(24),
    otherwise: Joi.forbidden()
  })
}).meta({ className: 'SomeSchema' });

export const AlternativesWithFunctionSchema = Joi.alternatives([
  Joi.function().minArity(2),
  Joi.object({
    json: Joi.any().required()
  }),
  Joi.object({
    raw: Joi.string().required()
  })
]).meta({ className: 'AlternativesWithFunctionInterface' });

export const AlternativesArrayOptional = Joi.object({
  oneOrTheOtherMaybe: Joi.array()
    .items(Joi.alternatives([Joi.number(), Joi.string(), Joi.alternatives()]))
    .required()
}).meta({ className: 'AlternativesArrayOptionalInterface' });

export const alternativesRawNoDescSchema = Joi.alternatives([Joi.number(), Joi.string()]).meta({
  className: 'AlternativesRawNoDesc',
  disableDescription: true
});

export const alternativesObjectNoDescSchema = Joi.object({
  myVal: Joi.alternatives([Joi.number(), Joi.string()])
}).meta({ className: 'AlternativesObjectNoDesc', disableDescription: true });
