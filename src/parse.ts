import Joi from 'joi';
import { filterMap } from './utils';
import { TypeContent, makeTypeContentRoot, makeTypeContentChild } from './types';

export const supportedJoiTypes = ['array', 'object', 'alternatives', 'any', 'boolean', 'date', 'number', 'string'];
// unsupported: 'link'| 'binary' | 'symbol'

export interface BaseDescribe extends Joi.Description {
  flags?: {
    label?: string;
    description?: string;
    presence?: 'optional' | 'required';
  };
}

export interface ArrayDescribe extends BaseDescribe {
  type: 'array';
  items: Describe[];
}

export interface ObjectDescribe extends BaseDescribe {
  type: 'object';
  keys: Record<'string', Describe>;
}

export interface AlternativesDescribe extends BaseDescribe {
  type: 'alternatives';
  matches: { schema: Describe }[];
}

export interface StringDescribe extends BaseDescribe {
  type: 'string';
  allow?: string[];
}

export interface BasicDescribe extends BaseDescribe {
  type: 'any' | 'boolean' | 'date' | 'number';
}

export type Describe = ArrayDescribe | BasicDescribe | ObjectDescribe | AlternativesDescribe | StringDescribe;

function getLabelAndDescription(details: Describe): { label?: string; description?: string } {
  console.log(`parse.ts:43~~~~~~~~~~~~~~~~~~~${JSON.stringify(details, null, 4)}~~~~~~~~~~~~~~~~~~~`);
  const label = details.flags?.label;
  const description = details.flags?.description;
  return { label, description };
}

export function getAllCustomTypes(parsedSchema: TypeContent): string[] {
  if (parsedSchema.__isRoot) {
    return parsedSchema.children.flatMap(child => getAllCustomTypes(child));
  } else {
    return parsedSchema.customTypes || [];
  }
}

export function typeContentToTs(parsedSchema: TypeContent, doExport = false): string {
  if (!parsedSchema.__isRoot) {
    return parsedSchema.content;
  }

  const children = parsedSchema.children;
  if (doExport && !parsedSchema.name) {
    throw 'Type ${JSON.stringify(parsedSchema)} needs a name to be exported';
  }
  switch (parsedSchema.joinOperation) {
    case 'list': {
      const childrenContent = children.map(child => typeContentToTs(child));
      if (childrenContent.length > 1) {
        throw 'Multiple array item types not supported';
      }
      const arrayStr = `${childrenContent[0]}[]`;
      if (doExport) {
        return `export type ${parsedSchema.name} = ${arrayStr};`;
      }
      return arrayStr;
    }
    case 'union': {
      const childrenContent = children.map(child => typeContentToTs(child));
      const unionStr = childrenContent.join(' | ');
      if (doExport) {
        return `export type ${parsedSchema.name} = ${unionStr};`;
      }
      return unionStr;
    }
    case 'object': {
      const childrenContent = children.map(child => {
        const childStr = typeContentToTs(child);
        // TODO: configure indent length
        return `\t${child.name}: ${childStr};`;
      });

      const objectStr = `{\n${childrenContent.join('\n')}\n}`;
      if (doExport) {
        return `export interface ${parsedSchema.name} ${objectStr}`;
      }
      return objectStr;
    }
    default:
      throw 'Unsupported join operation ${parsedSchema.joinOperation}';
  }
}

// TODO: will be issues with useLabels if a nested schema has a label but is not exported on its own

// TODO: will need to pass around ignoreLabels more
/**
 * Parses a joi schema into a TypeContent
 * @param details: the joi schema
 * @param useLabels if true and if a schema has a label we won't parse it and instead just reference the label in the outputted type
 * @param ignoreLabels a list a label to ignore if found. Sometimes nested joi schemas will inherit the parents label so we want to ignore that
 */
export function parseSchema(details: Describe, useLabels = true, ignoreLabels: string[] = []): TypeContent | undefined {
  function parseHelper(): TypeContent | undefined {
    switch (details.type) {
      case 'array':
        return parseArray(details);
      case 'string':
        return parseStringSchema(details);
      case 'alternatives':
        return parseAlternatives(details);
      case 'object':
        return parseObjects(details);
      default:
        return parseBasicSchema(details);
    }
  }
  const { label, description } = getLabelAndDescription(details);
  if (label && useLabels && !ignoreLabels.includes(label)) {
    // skip parsing and just reference the label since we assumed we parsed the schema the label references
    return makeTypeContentChild({ content: label, customTypes: [label] });
  }
  if (!supportedJoiTypes.includes(details.type)) {
    // TODO: debug/better error logging
    console.log(`unsupported type: ${details.type}`);
    return undefined;
  }
  const parsedSchema = parseHelper();
  if (!parsedSchema) {
    return undefined;
  }
  parsedSchema.name = label;
  parsedSchema.description = description;
  return parsedSchema;
}

function parseBasicSchema(details: BasicDescribe): TypeContent | undefined {
  const { label: name, description } = getLabelAndDescription(details);

  const joiType = details.type;
  let content = joiType as string;
  if (joiType === 'date') {
    content = 'Date';
  }
  return makeTypeContentChild({ content, name, description });
}

function parseStringSchema(details: StringDescribe): TypeContent | undefined {
  const label = details?.flags?.label;
  const values = details.allow;
  if (values && values.length !== 0) {
    const allowedValues = values.map(value => makeTypeContentChild({ content: `'${value}'` }));
    return makeTypeContentRoot({ joinOperation: 'union', children: allowedValues, name: label });
  }
  return makeTypeContentChild({ content: 'string', name: label });
}

function parseArray(details: ArrayDescribe): TypeContent | undefined {
  // TODO: handle multiple things in the items arr
  const item = details.items[0];
  const { label: name, description } = getLabelAndDescription(details);

  const child = parseSchema(item);
  return child ? makeTypeContentRoot({ joinOperation: 'list', children: [child], name, description }) : undefined;
}

function parseAlternatives(details: AlternativesDescribe): TypeContent | undefined {
  const { label, description } = getLabelAndDescription(details);
  const ignoreLabels = label ? [label] : [];
  const children = filterMap(details.matches, match => {
    return parseSchema(match.schema, true, ignoreLabels);
  });
  if (children.length === 0) {
    return undefined;
  }

  return makeTypeContentRoot({ joinOperation: 'union', children, name: label, description });
}

function parseObjects(details: ObjectDescribe): TypeContent | undefined {
  const children = filterMap(Object.entries(details.keys), ([key, value]) => {
    const parsedSchema = parseSchema(value);
    if (!parsedSchema) {
      return undefined;
    }
    parsedSchema.name = key;
    return parsedSchema;
  });

  if (children.length === 0) {
    return undefined;
  }

  const { label: name, description } = getLabelAndDescription(details);
  return makeTypeContentRoot({ joinOperation: 'object', children, name, description });
}
