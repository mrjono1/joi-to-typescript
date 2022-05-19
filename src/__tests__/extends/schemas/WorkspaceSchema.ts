import Joi from 'joi';

export const WorkspaceSchema = Joi.object({
  steve: Joi.string()
  // statistics: Joi.object({
  //   views: Joi.number(),
  //   members: Joi.number()
  // })
})
  .meta({ className: 'IWorkspace' });
