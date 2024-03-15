import { filterMap, isDescribe, toStringLiteral } from './utils';
import { JsDoc, makeTypeContentChild, makeTypeContentRoot, Settings, TypeContent, TypeContentRoot } from './types';
import {
  AlternativesDescribe,
  ArrayDescribe,
  BaseDescribe,
  BasicDescribe,
  Describe,
  ObjectDescribe,
  StringDescribe
} from './joiDescribeTypes';
import {
  getAllowValues,
  getDisableDescription,
  getInterfaceOrTypeName,
  getIsReadonly,
  getMetadataFromDetails
} from './joiUtils';
import { getIndentStr, getJsDocString } from './write';
import util from 'node:util'; // see __tests__/joiTypes.ts for more information

// see __tests__/joiTypes.ts for more information
export const supportedJoiTypes = ['array', 'object', 'alternatives', 'any', 'boolean', 'date', 'number', 'string'];

// @TODO - Temporarily used prevent 'map' and 'set' from being used by cast
//         Remove once support for 'map' and 'set' is added
const validCastTo = ['string', 'number'];

function getCommonDetails(
  details: Describe,
  settings: Settings
): { interfaceOrTypeName?: string; jsDoc: JsDoc; required: boolean; value?: unknown; isReadonly?: boolean } {
  const interfaceOrTypeName = getInterfaceOrTypeName(settings, details);

  const description = details.flags?.description;
  const presence = details.flags?.presence;
  let value = details.flags?.default;
  if (
    value &&
    typeof value === 'object' &&
    'special' in value &&
    value.special === 'deep' &&
    Object.keys(value).length === 1
  ) {
    // Special case. When using the empty `default()` function on
    // a schema entry, Joi adds a special symbol to the entry, which
    // is converted to {"special": "deep"} via describe.
    // When this case comes up, we can ignore it.
    // Ref: https://github.com/hapijs/joi/blob/e7e9c5d18dafaa510a7ece02c225653db5fc998f/lib/manifest.js#L179
    value = undefined;
  }

  const defaultJsDoc =
    settings.supplyDefaultsInJsDoc && details.flags && 'default' in details.flags
      ? util.inspect(details.flags.default, { depth: null })
      : undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const examples: string[] = ((details.examples || []) as any[])
    .filter(e => e !== undefined)
    .map(example => {
      return typeof example === 'object'
        ? // Joi accepts `any` as type for an example
          JSON.stringify(example, null, 2)
        : example.toString();
    });

  const isReadonly = getIsReadonly(details);
  const disableJsDoc = getDisableDescription(details);

  let required;
  if (
    presence === 'required' ||
    (settings.treatDefaultedOptionalAsRequired && presence !== 'optional' && value !== undefined)
  ) {
    required = true;
  } else if (presence === 'optional') {
    required = false;
  } else {
    required = settings.defaultToRequired;
  }
  return {
    interfaceOrTypeName,
    jsDoc: { description, examples, default: defaultJsDoc, disable: disableJsDoc },
    required,
    value,
    isReadonly
  };
}

export function getAllCustomTypes(parsedSchema: TypeContent): string[] {
  const customTypes = [];
  if (parsedSchema.__isRoot) {
    customTypes.push(...parsedSchema.children.flatMap(child => getAllCustomTypes(child)));
  } else {
    customTypes.push(...(parsedSchema.customTypes ?? []));
  }
  return customTypes;
}

function getDefaultTypeTsContent(
  settings: Settings,
  indentLevel: number,
  parsedSchema: TypeContent,
  tsContent: string
) {
  if (!settings.unionNewLine) {
    return `${JSON.stringify(parsedSchema.value)} | ${tsContent}`;
  }

  const indent = getIndentStr(settings, indentLevel);
  return '\n' + indent + '| ' + JSON.stringify(parsedSchema.value) + '\n' + indent + '| ' + tsContent;
}

function typeContentToTsHelper(
  settings: Settings,
  parsedSchema: TypeContent,
  indentLevel: number,
  doExport = false
): { tsContent: string; jsDoc?: JsDoc } {
  if (!parsedSchema.__isRoot) {
    const tsContent = settings.supplyDefaultsInType
      ? parsedSchema.value !== undefined
        ? getDefaultTypeTsContent(settings, indentLevel, parsedSchema, parsedSchema.content)
        : parsedSchema.content
      : parsedSchema.content;
    if (doExport) {
      return {
        tsContent: `export type ${parsedSchema.interfaceOrTypeName} = ${tsContent};`,
        jsDoc: parsedSchema.jsDoc
      };
    }

    return {
      tsContent,
      jsDoc: parsedSchema.jsDoc
    };
  }

  const children = parsedSchema.children;
  if (doExport && !parsedSchema.interfaceOrTypeName) {
    // Cannot figured a way to make this error happen
    /* istanbul ignore next */
    throw new Error(`Type ${JSON.stringify(parsedSchema)} needs a name to be exported`);
  }
  switch (parsedSchema.joinOperation) {
    case 'list': {
      const childrenContent = children.map(child => typeContentToTsHelper(settings, child, indentLevel));
      if (childrenContent.length > 1) {
        /* istanbul ignore next */
        throw new Error('Multiple array item types not supported');
      }
      let content = childrenContent[0].tsContent;
      if (content.includes('|')) {
        // TODO: might need a better way to add the parens for union
        content = `(${content})`;
      }
      const arrayStr = settings.supplyDefaultsInType
        ? parsedSchema.value !== undefined
          ? getDefaultTypeTsContent(settings, indentLevel, parsedSchema, `${content}[]`)
          : `${content}[]`
        : `${content}[]`;
      if (doExport) {
        return {
          tsContent: `export type ${parsedSchema.interfaceOrTypeName} = ${arrayStr};`,
          jsDoc: parsedSchema.jsDoc
        };
      }
      return { tsContent: arrayStr, jsDoc: parsedSchema.jsDoc };
    }
    case 'tuple':
    case 'union': {
      const isTuple = parsedSchema.joinOperation === 'tuple';

      const indentString = getIndentStr(settings, indentLevel);
      const itemSeparatorBeforeItem = isTuple ? '' : ' |';
      const itemSeparatorAfterItem = isTuple ? ',' : '';
      const itemSeparatorAfterNewline = isTuple ? '' : '|';

      let hasOneDescription = false;
      let finalStr: string;

      const childrenContent: string[] = [];
      let first = true;
      let previousIsInline = false;
      if (settings.supplyDefaultsInType && parsedSchema.value !== undefined) {
        if (settings.unionNewLine) {
          childrenContent.push('\n' + indentString + '| ' + JSON.stringify(parsedSchema.value));
          previousIsInline = false;
        } else {
          childrenContent.push(JSON.stringify(parsedSchema.value));
          previousIsInline = true;
        }
        first = false;
      }
      for (let itemIdx = 0; itemIdx < children.length; itemIdx++) {
        const child = children[itemIdx];
        const childInfo = typeContentToTsHelper(
          settings,
          child,
          // Special case for objects because their contents need to be indented once more
          child.__isRoot && ['object', 'list', 'tuple'].includes(child.joinOperation) ? indentLevel + 1 : indentLevel
        );
        const descriptionStr = getJsDocString(
          settings,
          child.interfaceOrTypeName as string,
          childInfo.jsDoc,
          indentLevel
        );
        hasOneDescription ||= descriptionStr !== '';

        // Prevents test failures because of spaces at line endings
        let childInfoTsContentPrefix = '';
        if (isTuple) {
          if (previousIsInline) {
            childInfoTsContentPrefix = ' ';
          }
        } else {
          childInfoTsContentPrefix = childInfo.tsContent.startsWith('\n') ? '' : ' ';
        }

        /*
          Compose the child code line. If there is a description, it must be above the entry.
           */
        let childContent = childInfo.tsContent;
        let itemPrefixWithIndent = indentString + itemSeparatorAfterNewline;
        let skipNewline = false;
        if (childContent.includes('|')) {
          childContent = `(${childContent})`;
        }
        if (isTuple) {
          childContent += child.required ? '' : '?';
        } else {
          // Make sure we don't repeat by accident multiple | when joining unions
          if (settings.unionNewLine && childContent.trimStart().startsWith('|')) {
            itemPrefixWithIndent = '';
            skipNewline = true;
          }
        }
        childContent += itemIdx < children.length - 1 ? itemSeparatorAfterItem : '';
        if (
          descriptionStr !== '' ||
          (children.length > 1 && ((!isTuple && settings.unionNewLine) || (isTuple && settings.tupleNewLine)))
        ) {
          // If there is a description it means we also have a new line, which means
          // we need to properly indent the following line too.
          let prefix = descriptionStr;
          if (prefix === '') {
            if (first) {
              prefix = '';
            } else {
              prefix = skipNewline ? '' : '\n';
            }
          }
          let tsContentPrefix = childInfoTsContentPrefix;
          if (tsContentPrefix === '') {
            // Handle the case where we are wrapping the child content, and we need
            // to make some space between the union operator and the content
            if (itemPrefixWithIndent.endsWith('|') && childContent.startsWith('(')) {
              tsContentPrefix = ' ';
            }
          }
          childrenContent.push(
            (first ? (skipNewline ? '' : '\n') : '') +
              `${prefix}${itemPrefixWithIndent}${tsContentPrefix}${childContent}`
          );
          previousIsInline = false;
        } else {
          // Normal inline content
          childrenContent.push(
            (first
              ? ''
              : (previousIsInline ? itemSeparatorBeforeItem : itemPrefixWithIndent) + childInfoTsContentPrefix) +
              childContent
          );
          previousIsInline = true;
        }
        first = false;
      }
      finalStr = childrenContent.join(hasOneDescription ? '\n' : '');

      if (isTuple) {
        finalStr = `[${finalStr}${hasOneDescription ? '\n' + getIndentStr(settings, indentLevel - 1) : ''}${
          settings.tupleNewLine ? '\n' + getIndentStr(settings, indentLevel - 1) : ''
        }]`;
      }

      if (doExport) {
        return {
          tsContent: `export type ${parsedSchema.interfaceOrTypeName} =${
            // Prevents test failures because of spaces at line endings
            finalStr.startsWith('\n') ? '' : ' '
          }${finalStr};`,
          jsDoc: parsedSchema.jsDoc
        };
      }
      return { tsContent: finalStr, jsDoc: parsedSchema.jsDoc };
    }
    case 'objectWithUndefinedKeys':
    case 'object': {
      if (!children.length && !doExport) {
        if (parsedSchema.joinOperation === 'objectWithUndefinedKeys') {
          return { tsContent: 'object', jsDoc: parsedSchema.jsDoc };
        } else {
          return { tsContent: 'Record<string, never>', jsDoc: parsedSchema.jsDoc };
        }
      }

      // interface can have no properties {} if the joi object has none defined
      let objectStr = '{}';
      let hasDefault = false;

      if (children.length !== 0) {
        const childrenContent = children.map(child => {
          const childInfo = typeContentToTsHelper(settings, child, indentLevel + 1, false);

          // forcing name to be defined here, might need a runtime check but it should be set if we are here
          const descriptionStr = getJsDocString(
            settings,
            child.interfaceOrTypeName as string,
            childInfo.jsDoc,
            indentLevel
          );
          const optionalStr = child.required ? '' : '?';
          const indentString = getIndentStr(settings, indentLevel);
          const modifier = child.isReadonly ? 'readonly ' : '';
          return [
            descriptionStr,
            indentString,
            modifier,
            child.interfaceOrTypeName,
            optionalStr,
            ':',
            // Prevents test failures because of spaces at line endings
            childInfo.tsContent.startsWith('\n') ? '' : ' ',
            childInfo.tsContent,
            ';'
          ].join('');
        });
        objectStr = `{\n${childrenContent.join('\n')}\n${getIndentStr(settings, indentLevel - 1)}}`;

        if (parsedSchema.value !== undefined && settings.supplyDefaultsInType) {
          objectStr = getDefaultTypeTsContent(settings, indentLevel, parsedSchema, objectStr);
          hasDefault = true;
        }
      }
      if (doExport) {
        if (hasDefault) {
          return {
            tsContent: `export type ${parsedSchema.interfaceOrTypeName} = ${objectStr}`,
            jsDoc: parsedSchema.jsDoc
          };
        }
        return {
          tsContent: `export interface ${parsedSchema.interfaceOrTypeName} ${objectStr}`,
          jsDoc: parsedSchema.jsDoc
        };
      }
      return { tsContent: objectStr, jsDoc: parsedSchema.jsDoc };
    }
    default:
      throw new Error(`Unsupported join operation ${parsedSchema.joinOperation}`);
  }
}

export function typeContentToTs(settings: Settings, parsedSchema: TypeContent, doExport = false): string {
  const { tsContent, jsDoc } = typeContentToTsHelper(settings, parsedSchema, 1, doExport);
  // forcing name to be defined here, might need a runtime check but it should be set if we are here
  const descriptionStr = getJsDocString(settings, parsedSchema.interfaceOrTypeName as string, jsDoc);
  return `${descriptionStr}${tsContent}`;
}

function parseHelper(details: Describe, settings: Settings, rootSchema?: boolean): TypeContent | undefined {
  // Convert type if a valid cast type is present
  if (details.flags?.cast && validCastTo.includes(details.flags?.cast as 'number' | 'string')) {
    // @NOTE - if additional values are added beyond 'string' and 'number' further transformation will
    // be needed on the details object to support those types
    details.type = details.flags?.cast as 'string' | 'number';
  }

  switch (details.type) {
    case 'array':
      return parseArray(details, settings);
    case 'string':
      return parseStringSchema(details, settings, rootSchema ?? false);
    case 'alternatives':
      return parseAlternatives(details, settings);
    case 'object':
      return parseObjects(details, settings);
    default:
      return parseBasicSchema(details, settings, rootSchema ?? false);
  }
}

// TODO: will be issues with useLabels if a nested schema has a label but is not exported on its own

// TODO: will need to pass around ignoreLabels more
/**
 * Parses a joi schema into a TypeContent
 * @param details: the joi schema
 * @param settings: settings used for parsing
 * @param useLabels if true and if a schema has a label we won't parse it and instead just reference the label in the outputted type
 * @param ignoreLabels a list a label to ignore if found. Sometimes nested joi schemas will inherit the parents label so we want to ignore that
 * @param rootSchema
 */
export function parseSchema(
  details: Describe,
  settings: Settings,
  useLabels = true,
  ignoreLabels: string[] = [],
  rootSchema?: boolean
): TypeContent | undefined {
  const { interfaceOrTypeName, jsDoc, required, value, isReadonly } = getCommonDetails(details, settings);
  if (interfaceOrTypeName && useLabels && !ignoreLabels.includes(interfaceOrTypeName)) {
    // skip parsing and just reference the label since we assumed we parsed the schema that the label references
    // TODO: do we want to use the labels description if we reference it?
    let allowedValues = createAllowTypes(details);

    const child = makeTypeContentChild({
      content: interfaceOrTypeName,
      customTypes: [interfaceOrTypeName],
      // If we have any allowed values, remove the jsDoc from the child as we will use it in the outer object
      jsDoc: allowedValues.length > 0 ? undefined : jsDoc,
      required,
      isReadonly
    });

    if (allowedValues.length > 0) {
      if (!details.flags?.only) {
        allowedValues.unshift(child);
      } else {
        allowedValues = [child];
      }

      return makeTypeContentRoot({
        joinOperation: 'union',
        interfaceOrTypeName: '',
        children: allowedValues,
        jsDoc,
        required,
        isReadonly
      });
    }
    return child;
  }

  const baseTypes: string[] = getMetadataFromDetails('baseType', details);
  if (baseTypes.length > 0) {
    // If there is a baseType defined, then the user is overriding the
    // type definition.

    // If there are multiple base types then the deepest one will be at the
    // end of the list which is most likely the one to use.
    const typeToUse = baseTypes.pop() as string;

    if (settings.debug) {
      // eslint-disable-next-line no-console
      console.debug(`Using user-defined '${typeToUse}' for type '${details.type}'`);
    }
    return makeTypeContentChild({ content: typeToUse, interfaceOrTypeName, jsDoc, required, isReadonly });
  } else if (!supportedJoiTypes.includes(details.type)) {
    let typeToUse;
    // Let's see if we can map the type to something sensible.
    // If not, then set it to 'unknown'.
    switch (details.type as string) {
      case 'function':
        typeToUse = '((...args: any[]) => any)';
        break;

      case 'symbol':
        typeToUse = 'symbol';
        break;

      case 'binary':
        typeToUse = 'Buffer';
        break;

      default:
        typeToUse = 'unknown';
        break;
    }

    if (settings.debug) {
      // eslint-disable-next-line no-console
      console.debug(`Using '${typeToUse}' for unsupported type '${details.type}'`);
    }
    return makeTypeContentChild({ content: typeToUse, interfaceOrTypeName, jsDoc, required, isReadonly });
  }
  const parsedSchema = parseHelper(details, settings, rootSchema);
  if (!parsedSchema) {
    return undefined;
  }
  parsedSchema.interfaceOrTypeName = interfaceOrTypeName;
  parsedSchema.jsDoc = jsDoc;
  parsedSchema.required = required;
  parsedSchema.value = value;
  parsedSchema.isReadonly = isReadonly;

  return parsedSchema;
}

function parseBasicSchema(details: BasicDescribe, settings: Settings, rootSchema: boolean): TypeContent | undefined {
  const { interfaceOrTypeName, jsDoc } = getCommonDetails(details, settings);

  const joiType = details.type;
  let content = joiType as string;
  if (joiType === 'date') {
    content = 'Date';
  }
  const values = getAllowValues(details.allow);

  // at least one value
  if (values.length !== 0) {
    const allowedValues = createAllowTypes(details);

    if (values[0] === null && !details.flags?.only) {
      allowedValues.unshift(makeTypeContentChild({ content }));
    }
    return makeTypeContentRoot({ joinOperation: 'union', children: allowedValues, interfaceOrTypeName, jsDoc });
  }

  if (rootSchema) {
    return makeTypeContentRoot({
      joinOperation: 'union',
      children: [makeTypeContentChild({ content, interfaceOrTypeName })],
      interfaceOrTypeName,
      jsDoc
    });
  } else {
    return makeTypeContentChild({ content, interfaceOrTypeName, jsDoc });
  }
}

function createAllowTypes(details: BaseDescribe): TypeContent[] {
  const values = getAllowValues(details.allow);

  // at least one value
  if (values.length !== 0) {
    const allowedValues = values.map((value: unknown) =>
      makeTypeContentChild({ content: typeof value === 'string' ? toStringLiteral(value) : `${value}` })
    );
    return allowedValues;
  }

  return [];
}

/**
 * `undefined` is not part of this list as that would make the field optional instead
 */
const stringAllowValues = [null, ''];

function parseStringSchema(details: StringDescribe, settings: Settings, rootSchema: boolean): TypeContent | undefined {
  const { interfaceOrTypeName, jsDoc } = getCommonDetails(details, settings);
  const values = getAllowValues(details.allow);

  // at least one value
  if (values.length !== 0) {
    if (values.length === 1 && values[0] === '') {
      // special case of empty string sometimes used in Joi to allow just empty string
    } else {
      const allowedValues = values.map(value =>
        stringAllowValues.includes(value) && value !== ''
          ? makeTypeContentChild({ content: `${value}` })
          : makeTypeContentChild({ content: toStringLiteral(value) })
      );

      if (values.filter(value => stringAllowValues.includes(value)).length === values.length) {
        allowedValues.unshift(makeTypeContentChild({ content: 'string' }));
      }
      return makeTypeContentRoot({ joinOperation: 'union', children: allowedValues, interfaceOrTypeName, jsDoc });
    }
  }

  if (rootSchema) {
    return makeTypeContentRoot({
      joinOperation: 'union',
      children: [makeTypeContentChild({ content: 'string', interfaceOrTypeName })],
      interfaceOrTypeName,
      jsDoc
    });
  } else {
    return makeTypeContentChild({ content: 'string', interfaceOrTypeName, jsDoc });
  }
}

function parseArray(details: ArrayDescribe, settings: Settings): TypeContent | undefined {
  const { interfaceOrTypeName, jsDoc } = getCommonDetails(details, settings);
  const isSparse = details.flags?.sparse;

  if (details.ordered && !details.items) {
    const parsedChildren = details.ordered.map(item => parseSchema(item, settings)).filter(Boolean) as TypeContent[];
    const allowedValues = createAllowTypes(details);

    // at least one value
    if (allowedValues.length > 0) {
      allowedValues.unshift(
        makeTypeContentRoot({
          joinOperation: 'tuple',
          children: parsedChildren,
          interfaceOrTypeName
        })
      );

      return makeTypeContentRoot({ joinOperation: 'union', children: allowedValues, interfaceOrTypeName, jsDoc });
    }

    return makeTypeContentRoot({
      joinOperation: 'tuple',
      children: parsedChildren,
      interfaceOrTypeName,
      jsDoc
    });
  }

  // TODO: handle multiple things in the items arr
  const item = details.items && !details.ordered ? details.items[0] : ({ type: 'any' } as Describe);
  const child = parseSchema(item, settings);
  if (!child) {
    return undefined;
  }

  const allowedValues = createAllowTypes(details);
  // at least one value
  if (allowedValues.length !== 0) {
    allowedValues.unshift(
      makeTypeContentRoot({ joinOperation: 'list', children: [child], interfaceOrTypeName, jsDoc })
    );

    return makeTypeContentRoot({ joinOperation: 'union', children: allowedValues, interfaceOrTypeName, jsDoc });
  }
  if (isSparse) {
    return makeTypeContentRoot({
      joinOperation: 'list',
      children: [
        makeTypeContentRoot({
          joinOperation: 'union',
          children: [child, makeTypeContentChild({ content: 'undefined' })],
          interfaceOrTypeName,
          jsDoc
        })
      ],
      interfaceOrTypeName,
      jsDoc
    });
  }

  return makeTypeContentRoot({ joinOperation: 'list', children: [child], interfaceOrTypeName, jsDoc });
}

function parseAlternatives(details: AlternativesDescribe, settings: Settings): TypeContent | undefined {
  const { interfaceOrTypeName, jsDoc } = getCommonDetails(details, settings);
  const ignoreLabels = interfaceOrTypeName ? [interfaceOrTypeName] : [];

  const children: TypeContent[] = [];

  if (details.matches === undefined) {
    // Edge case where the user does not pass ANY content to the `alternatives` function.
    // In the official docs: If no schemas are added, the type will not match any value except for undefined.
    children.push(makeTypeContentChild({ content: 'undefined' }));
  } else {
    children.push(
      ...filterMap(details.matches, match => {
        // ignore alternatives().conditional() and return 'any' since we don't handle is / then / otherwise for now
        if (!match.schema) {
          return parseSchema({ type: 'any' }, settings, true, ignoreLabels);
        }
        return parseSchema(match.schema, settings, true, ignoreLabels);
      })
    );
  }

  // This is a check that cannot be tested as Joi throws an error before this package
  // can be called, there is test for it in alternatives
  if (children.length === 0) {
    /* istanbul ignore next */
    return undefined;
  }

  const allowedValues = createAllowTypes(details);

  return makeTypeContentRoot({
    joinOperation: 'union',
    children: [...children, ...allowedValues],
    interfaceOrTypeName,
    jsDoc
  });
}

function buildUnknownTypeContent(unknownType = 'unknown'): TypeContent {
  return {
    __isRoot: false,
    content: unknownType,
    interfaceOrTypeName: '[x: string]',
    required: true,
    jsDoc: { description: `${unknownType && unknownType[0].toUpperCase() + unknownType.slice(1)} Property` }
  };
}

function parseUnknown(details: ObjectDescribe, settings: Settings): TypeContent {
  const unknownTypes = getMetadataFromDetails('unknownType', details);

  const type = unknownTypes.pop();

  if (typeof type === 'string') {
    return buildUnknownTypeContent(type);
  }

  if (isDescribe(type)) {
    const typeContent = parseSchema(type, settings);

    if (!typeContent) {
      // Can't think of a way to make this happen but want to keep this ready just in case
      /* istanbul ignore next */
      return buildUnknownTypeContent();
    }

    return {
      ...typeContent,
      interfaceOrTypeName: '[x: string]',
      required: true
    };
  }

  return buildUnknownTypeContent();
}

function parseObjects(details: ObjectDescribe, settings: Settings): TypeContent | undefined {
  const joinOperation: TypeContentRoot['joinOperation'] =
    details.keys === undefined
      ? // When using Joi.object() without any argument, joi defaults to allowing ANY key/pair
        // inside the object. This is reflected in the absence of the `keys` field in the `details` var.
        'objectWithUndefinedKeys'
      : 'object';
  let children = filterMap(Object.entries(details.keys || {}), ([key, value]) => {
    const parsedSchema = parseSchema(value, settings);
    // The only type that could return this is alternatives
    // see parseAlternatives for why this is ignored
    if (!parsedSchema) {
      return undefined;
    }
    parsedSchema.interfaceOrTypeName = /^[$A-Z_][0-9A-Z_$]*$/i.test(key || '') ? key : `'${key}'`;
    return parsedSchema;
  });
  const isMap = details.patterns?.length === 1 && details.patterns[0].schema.type === 'string';
  if (details?.flags?.unknown === true || isMap) {
    children.push(parseUnknown(details, settings));
  }

  if (settings.sortPropertiesByName) {
    children = children.sort((a, b) => {
      if (!a.interfaceOrTypeName || !b.interfaceOrTypeName) {
        // interfaceOrTypeName should never be null at this point this is just in case
        /* istanbul ignore next */
        return 0;
      } else if (a.interfaceOrTypeName > b.interfaceOrTypeName) {
        return 1;
      } else if (a.interfaceOrTypeName < b.interfaceOrTypeName) {
        return -1;
      }
      // this next line can never happen as the object is totally invalid as the object is invalid
      // the code would not build so ignoring this
      /* istanbul ignore next */
      return 0;
    });
  }

  const { interfaceOrTypeName, jsDoc } = getCommonDetails(details, settings);

  const allowedValues = createAllowTypes(details);

  // at least one value
  if (allowedValues.length !== 0) {
    allowedValues.unshift(makeTypeContentRoot({ joinOperation, children, interfaceOrTypeName, jsDoc }));

    return makeTypeContentRoot({ joinOperation: 'union', children: allowedValues, interfaceOrTypeName, jsDoc });
  }

  return makeTypeContentRoot({ joinOperation, children, interfaceOrTypeName, jsDoc });
}
