import Joi from 'joi';
import { PersonSchema } from './PersonSchema';

export const ItemSchema = Joi.object({
  name: Joi.string().required()
}).label('Item');

export const PeopleSchema = Joi.array()
  .items(PersonSchema)
  .required()
  .label('People')
  .description('A list of People');

export const TestSchema = Joi.object({
  name: Joi.string().optional(),
  propertyName1: Joi.boolean().required(),
  people: PeopleSchema.optional()
})
  .label('Test')
  .description('a test schema definition');
