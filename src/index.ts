import { ObjectSchema } from "joi";
import {
  getLabel,
  getDescription,
  getRequired,
  getProperties,
  getPropertyName,
  getPropertyType
} from "joiHelpers";

export interface Settings {
  defaultToRequired: boolean;
  debug?: boolean;
}
export interface InterfaceRecord {
  name: string;
  content: string;
  fileName?: string;
}

export const convertObject = (
  joi: ObjectSchema,
  settings?: Settings
): InterfaceRecord[] => {
  if (!settings) {
    settings = {
      defaultToRequired: false,
      debug: false
    };
  }

  // console.log(joi);

  const types: InterfaceRecord[] = [];

  const name = getLabel(joi);
  if (!name) {
    throw 'At least one "object" does not have a .label()';
  }

  const propertiesAndInterfaces = getPropertiesAndInterfaces(joi, settings);

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
  defaults: Settings
): PropertiesAndInterfaces => {
  const result: PropertiesAndInterfaces = { properties: [], interfaces: [] };

  const joiProperties = getProperties(joi);
  for (const joiProperty of joiProperties) {
    const name = getPropertyName(joiProperty);
    if (!name) {
      if (defaults.debug) {
        console.log("Property Name not found");
      }
      continue;
    }
    const type = getPropertyType(joiProperty);
    if (!type) {
      if (defaults.debug) {
        console.log("Property Type not found");
      }
      continue;
    }

    let required = getRequired(joiProperty) ?? defaults.defaultToRequired;

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
