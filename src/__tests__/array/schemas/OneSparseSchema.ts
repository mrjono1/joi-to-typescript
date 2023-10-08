import Joi from 'joi';
import {ItemSchema} from './OneSchema'

export const SparseTestListSchema = Joi.array()
  .items(ItemSchema)
  .sparse()
  .meta({ className: 'SparseTestList' })
  .description('A sparse list of Item object');