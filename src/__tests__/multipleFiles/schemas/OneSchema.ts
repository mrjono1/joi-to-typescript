import Joi from 'joi';
import { PersonSchema } from './PersonSchema';

export const ZebraSchema = Joi.object({
  name: Joi.string()
}).meta({ className: 'Zebra' });

export const ItemSchema = Joi.object({
  name: Joi.string().required(),
  maleZebra: ZebraSchema.description('Male Zebra'),
  femaleZebra: ZebraSchema.description('Female Zebra')
}).meta({ className: 'Item' });

export const PeopleSchema = Joi.array()
  .items(PersonSchema)
  .required()
  .meta({ className: 'People' })
  .description('A list of People');

export const TestSchema = Joi.object({
  name: Joi.string().optional(),
  propertyName1: Joi.boolean().required(),
  people: PeopleSchema.optional()
})
  .meta({ className: 'Test' })
  .description('a test schema definition');
