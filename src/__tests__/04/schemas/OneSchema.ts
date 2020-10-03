import Joi from 'joi';
import { PersonSchema } from './PersonSchema';

export const ZebraSchema = Joi.object({
  name: Joi.string()
}).label('Zebra');

export const ItemSchema = Joi.object({
  name: Joi.string().required(),
  maleZebra: ZebraSchema.description('Male Zebra'),
  femaleZebra: ZebraSchema.description('Female Zebra')
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
