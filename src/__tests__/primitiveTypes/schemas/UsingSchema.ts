import Joi from 'joi';
import { BlankNull } from './AllowSchema';

export const UsingOtherTypesSchema = Joi.object({
  property: BlankNull
});
