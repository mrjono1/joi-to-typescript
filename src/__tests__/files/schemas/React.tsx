import Joi from "joi";

export const ReactBarSchema = Joi.object({
  id: Joi.number().required().description('Id').example(1)
}).meta({ className: 'ReactBar' });
