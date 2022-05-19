import Joi from 'joi';
import { WorkspaceSchema } from './WorkspaceSchema';

export const PortfolioSchema = WorkspaceSchema.keys({
  john: Joi.string()
  // statistics: Joi.object({
  //   risks: Joi.object({
  //     open: Joi.number(),
  //     closed: Joi.number()
  //   })
  // })
})
  .meta({ className: 'IPortfolio' });
