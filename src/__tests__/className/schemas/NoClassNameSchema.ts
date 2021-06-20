import Joi from 'joi';

export const noClassNameSchema = Joi.object({
  name: Joi.string()
});
