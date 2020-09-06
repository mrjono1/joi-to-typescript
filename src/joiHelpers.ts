/**
 * This file is for interpreting the Joi Object Model
 */
import { ObjectSchema, AnySchema, ArraySchema } from 'joi';

/**
 * Get a schema .label()
 * @param joi a Joi schema
 */
export const getLabel = (joi: AnySchema): undefined | string => {
  return joi?._flags?.label;
};

/**
 * Get schema .description()
 * @param joi a Joi schema
 */
export const getDescription = (joi: AnySchema): undefined | string => {
  return joi?._flags?.description;
};

interface JoiProperty {
  key: string;
  schema: {
    type: string;
    _flags?: {
      presence?: 'optional' | 'required';
    };
    _valids?: {
      _values?: [];
    };
  };
}

/**
 * .optional() or .required()
 * @param property a Joi Property
 */
export const getRequired = (property: JoiProperty): undefined | boolean => {
  let required: undefined | boolean = undefined;
  const presence: undefined | string = property.schema._flags?.presence;

  if (presence) {
    if (presence === 'optional') {
      required = false;
    } else if (presence === 'required') {
      required = true;
    }
  }
  return required;
};

/**
 * Get and ObjectSchemas Properties
 * @param joi ObjectSchema
 */
export const getProperties = (joi: ObjectSchema): JoiProperty[] => {
  const properties: JoiProperty[] = [];

  if (joi.$_terms?.keys) {
    properties.push(...joi.$_terms.keys);
  }

  return properties;
};

/**
 * The property name
 * @param joiProperty a Joi property
 */
export const getPropertyName = (joiProperty: JoiProperty): undefined | string => {
  return joiProperty.key;
};

/**
 * A .label() defined on a .array()
 * @param joiArray ArraySchema
 */
export const getArrayTypeName = (joiArray: ArraySchema): undefined | string => {
  return joiArray?.$_terms?.items[0]?._flags?.label ?? joiArray?.$_terms?.items[0]?.type;
};

export interface PropertyType {
  typeName: string;
  baseTypeName: string;
}

export const getPropertyType = (joiProperty: JoiProperty): undefined | PropertyType => {
  const schemaType = joiProperty.schema?.type;
  if (!schemaType) {
    return undefined;
  }

  if (schemaType === 'array') {
    const itemName = getArrayTypeName(joiProperty.schema as ArraySchema);
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
    const values = joiProperty?.schema?._valids?._values;
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
