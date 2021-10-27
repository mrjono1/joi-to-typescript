/* eslint-disable @typescript-eslint/no-use-before-define */
import Joi from 'joi';

// Input
export const JobSchema = Joi.object({
  businessName: Joi.string().required(),
  jobTitle: Joi.string().required()
}).meta({ className: 'Job' });

export const WalletSchema = Joi.object({
  usd: Joi.number().required(),
  eur: Joi.number().required()
})
  .unknown()
  .meta({ className: 'Wallet', unknownType: 'number' });

export const PersonSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required().description('Last Name'),
  job: JobSchema,
  wallet: WalletSchema
}).meta({ className: 'Person' });

export const PeopleSchema = Joi.array()
  .items(PersonSchema)
  .required()
  .meta({ className: 'People' })
  .description('A list of People');
