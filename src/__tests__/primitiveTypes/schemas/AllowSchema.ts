import Joi from 'joi';

export const Name = Joi.string().optional().description('Test Schema Name').allow('').label('Name');
export const NullName = Joi.string().optional().description('nullable').allow(null);
export const BlankNull = Joi.string().optional().allow(null, '');
export const Blank = Joi.string().allow('');
export const NormalList = Joi.string().allow('red', 'green', 'blue');
export const NormalRequiredList = Joi.string().allow('red', 'green', 'blue').required();
export const Numbers = Joi.number().optional().allow(1, 2, 3, 4, 5);
export const NullNumber = Joi.number().optional().allow(null);
export const DateOptions = Joi.date().allow(null).description('This is date');
