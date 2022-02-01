import Joi from 'joi';

export const AddressSchema = Joi.object({
  addressLineNumber1: Joi.string().required(),
  Suburb: Joi.string().required()
}).meta({ className: 'Address' });
