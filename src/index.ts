import { ObjectSchema } from "joi";

export interface Defaults {
  required: boolean;
}
export interface InterfaceRecord {
  name: string;
  content: string;
  fileName?: string;
}

export const convertObject = (
  joi: ObjectSchema,
  defaults?: Defaults
): InterfaceRecord[] => {
  if (!defaults) {
    defaults = {
      required: false
    };
  }
  // console.log(joi);

  const types: InterfaceRecord[] = [];

  const name = getLabel(joi);
  if (!name) {
    throw 'At least one "object" does not have a .label()';
  }

  const propertiesAndInterfaces = getPropertiesAndInterfaces(joi, defaults);

  types.push({
    name,
    content: `${getInterfaceJsDoc(joi)}
export interface ${name} {
${propertiesAndInterfaces.properties.map(p => p.content).join(`\n`)}
}`
  });

  return types;
};

export interface Property {
  name: string;
  type: string;
  customType?: string;
  content: string;
}

export interface PropertiesAndInterfaces {
  properties: Property[];
  interfaces: InterfaceRecord[];
}

export const getPropertiesAndInterfaces = (
  joi: ObjectSchema,
  defaults: Defaults
): PropertiesAndInterfaces => {
  const result: PropertiesAndInterfaces = { properties: [], interfaces: [] };

  const keys = joi.$_terms?.keys;
  if (keys) {
    for (const key of keys) {
      const name = key.key;
      const type = key.schema.type;
      let required = defaults.required;
      if (key.schema._flags?.presence) {
        if (key.schema._flags.presence === "optional") {
          required = false;
        } else if (key.schema._flags.presence === "required") {
          required = true;
        }
      }
      const content = `  /**
   * ${name}
   */
  ${name}${required ? "" : "?"}: ${type};`;
      const property: Property = {
        name,
        type,
        content
      };
      result.properties.push(property);
    }
  }
  return result;
};

/**
 * Get Interface jsDoc
 */
export const getInterfaceJsDoc = (joi: ObjectSchema): string => {
  const name = getLabel(joi);
  const description = getDescription(joi);

  if (description) {
    return `/**
 * ${name}
 * ${description}
 */`;
  } else {
    return `/**
 * ${name}
 */`;
  }
};
export const getLabel = (joi: ObjectSchema): undefined | string => {
  return joi?._flags?.label;
};

export const getDescription = (joi: ObjectSchema): undefined | string => {
  return joi?._flags?.description;
};
