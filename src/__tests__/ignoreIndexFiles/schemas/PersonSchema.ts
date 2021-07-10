import Joi from 'joi';
import { AddressSchema } from './AddressSchema';

export const PersonSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  address: AddressSchema.required()
}).meta({ className: 'Person' });
