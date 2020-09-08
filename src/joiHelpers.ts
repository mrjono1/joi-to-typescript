/**
 * This file is for interpreting the Joi Object Model
 */
import Joi from 'joi';

/**
 * Not all properties have been typed so add them
 */
export interface Describe extends Joi.Description {
  flags: {
    label?: string;
    description?: string;
    presence?: 'optional' | 'required';
    only?: boolean;
  };
  items?: [{ flags?: { label?: string }; type?: string }];
}

/**
 * A .label() defined on a .array()
 * @param details joi.details() object
 */
export const getArrayTypeName = (details: Describe): undefined | string => {
  return details?.items?.[0]?.flags?.label ?? details?.items?.[0]?.type;
};

export interface PropertyType {
  typeName: string;
  baseTypeName: string;
}

export const getPropertyType = (joiProperty: Describe): undefined | PropertyType => {
  const schemaType = joiProperty?.type;
  if (!schemaType) {
    return undefined;
  }

  if (schemaType === 'array') {
    const itemName = getArrayTypeName(joiProperty);
    if (!itemName) {
      return undefined;
    }

    if (itemName === 'date') {
      return { typeName: `Date[]`, baseTypeName: 'Date' };
    }
    return { typeName: `${itemName}[]`, baseTypeName: itemName };
  }

  // Check if Enumeration
  if (schemaType === 'string') {
    const values = joiProperty.allow;
    if (values && values.length !== 0) {
      const enumerations = [...values].map(value => `'${value}'`).join(' | ');
      return { typeName: enumerations, baseTypeName: 'string' };
    }
  }

  if (schemaType === 'date') {
    return { typeName: 'Date', baseTypeName: 'Date' };
  }

  return { typeName: schemaType, baseTypeName: schemaType };
};
