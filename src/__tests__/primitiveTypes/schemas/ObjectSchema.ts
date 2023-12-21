import Joi from 'joi';

export const ObjectEmptyAnySchema = Joi.object().meta({ className: 'ObjectEmptyAny' });

export const ObjectEmptySchema = Joi.object({}).meta({ className: 'ObjectEmpty' });

export const ObjectWithObjectEmptySchema = Joi.object({
  nothing1: Joi.object({})
}).meta({ className: 'ObjectWithObjectEmpty' });
