/* eslint-disable @typescript-eslint/no-use-before-define */
import Joi from 'joi';

// Input
export const JobSchema = Joi.object({
  businessName: Joi.string().required(),
  jobTitle: Joi.string().required()
}).label('Job');

export const PersonSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required().description('Last Name'),
  job: JobSchema
}).label('Person');

export const PeopleSchema = Joi.array().items(PersonSchema).required().label('People').description('A list of People');
