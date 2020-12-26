import Joi from 'joi';
import { PersonSchema } from '../subDir/PersonSchema';
import { ItemSchema } from '../OneSchema';

export const EmployeeSchema = Joi.object({
  personalDetails: PersonSchema.required(),
  pet: ItemSchema.required()
}).label('Employee');
