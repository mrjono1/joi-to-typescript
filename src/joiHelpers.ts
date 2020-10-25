/**
 * This file is for interpreting the Joi Object Model
 */
import Joi from 'joi';
import { BasicJoiType, TypeContent } from './types';
import { filterMap } from './utils';

export interface Match {
  schema: Describe;
}

// TODO: might want to do a discriminating union on Describe.type to avoid casts on optional properties
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
  items?: [{ flags?: { label?: string }; type?: string; matches?: Match[] }];
  matches?: Match[];
}

/**
 * A .label() defined on a .array()
 * @param details joi.details() object
 */
export const getArrayTypeName = (details: Describe): undefined | string => {
  // TODO: handle parsing nested joi schemas
  const label = details?.items?.[0]?.flags?.label;
  if (label) {
    return label;
  }

  const type = details?.items?.[0]?.type;
  if (type === 'alternatives') {
    const typesToUnion = parseMatches(details?.items?.[0]?.matches as Match[]);
    if (typesToUnion.length === 0) {
      return undefined;
    }
    return `(${typesToUnion.map(t => t.content).join(' | ')})`;
  }
  return type;
};

export const getCustomTypes = (types: BasicJoiType[]): string[] => {
  return filterMap(types, property => {
    return property.customTypes ? property.customTypes : undefined;
  }).flat();
};

export interface PropertyType {
  typeName: string;
  baseTypeName: string | string[];
}

export const parseDescribe = (details: Describe): undefined | BasicJoiType => {
  const type = getSchemaType(details);
  if (!type) {
    return undefined;
  }
  // const name = details?.flags?.label;
  // if (!name) {
  //   throw 'no label field on ${JSON.stringify(details, null, 4)}';
  // }
  const content = type.typeName;
  return {
    type: type.typeName,
    content,
    customTypes: filterOutBasicTypes(type.baseTypeName)
  };
};

export function parseMatches(details: Match[]): BasicJoiType[] {
  return filterMap(details, detail => {
    return parseDescribe(detail.schema);
  });
}

export function getSchemaType(joiProperty: Describe): undefined | TypeContent {
  const schemaType = joiProperty?.type;
  // TODO: switch to use TypeContent. Will need to do custom type checking in here
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

  if (schemaType === 'object') {
    const objectType = joiProperty.flags.label;
    if (objectType) {
      return { typeName: objectType, baseTypeName: objectType };
    }
  }

  if (schemaType === 'alternatives') {
    const typesToUnion = parseMatches(joiProperty.matches as Match[]);
    if (typesToUnion.length === 0) {
      return undefined;
    }
    const types = typesToUnion.map(t => t.content);
    const unionStr = types.join(' | ');
    return { typeName: unionStr, baseTypeName: types };
  }

  return { typeName: schemaType, baseTypeName: schemaType };
}

/**
 * Is the type a TypeScript type or Custom
 * @param type type name
 */
export const isTypeCustom = (type: string): boolean => {
  switch (type.replace('[]', '')) {
    case 'string':
    case 'boolean':
    case 'number':
    case 'object':
    case 'Date':
      return false;
    default:
      return true;
  }
};

export function filterOutBasicTypes(types: string[] | string): string[] | undefined {
  if (!Array.isArray(types)) {
    types = [types];
  }
  const customTypes = types.filter(type => isTypeCustom(type));
  if (customTypes.length === 0) {
    return undefined;
  }
  return customTypes;
}
