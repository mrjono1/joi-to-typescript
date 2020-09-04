import Joi, { ObjectSchema, AnySchema, ArraySchema } from 'joi';
import Path from 'path';
import fs from 'fs';

import {
  getLabel,
  getDescription,
  getRequired,
  getProperties,
  getPropertyName,
  getPropertyType,
  getItemName
} from 'joiHelpers';
import { PropertiesAndInterfaces, Settings, InterfaceRecord, Property } from 'types';

/**
 * Get Interface jsDoc
 */
export const getInterfaceJsDoc = (joi: AnySchema): string => {
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

export const getPropertiesAndInterfaces = (joi: ObjectSchema, defaults: Settings): PropertiesAndInterfaces => {
  const result: PropertiesAndInterfaces = { properties: [], interfaces: [] };

  const joiProperties = getProperties(joi);
  for (const joiProperty of joiProperties) {
    const name = getPropertyName(joiProperty);
    if (!name) {
      if (defaults.debug) {
        console.log('Property Name not found');
      }
      continue;
    }
    const type = getPropertyType(joiProperty);
    if (!type) {
      if (defaults.debug) {
        console.log('Property Type not found');
      }
      continue;
    }

    const required = getRequired(joiProperty) ?? defaults.defaultToRequired;

    const content = `  /**
   * ${name}
   */
  ${name}${required ? '' : '?'}: ${type};`;
    const property: Property = {
      name,
      type,
      content
    };
    result.properties.push(property);
  }

  return result;
};
export const convertSchema = (joi: AnySchema, settings?: Settings): InterfaceRecord[] => {
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

  if (joi.type === 'array') {
    const itemName = getItemName(joi as ArraySchema);
    types.push({
      name,
      content: `${getInterfaceJsDoc(joi)}
export type ${name} = ${itemName}[];`
    });
  }

  if (joi.type === 'object') {
    const propertiesAndInterfaces = getPropertiesAndInterfaces(joi as ObjectSchema, settings);

    types.push({
      name,
      content: `${getInterfaceJsDoc(joi as ObjectSchema)}
export interface ${name} {
${propertiesAndInterfaces.properties.map(p => p.content).join(`\n`)}
}`
    });
  }

  return types;
};

export const convertFromDirectory = async (
  fromDirectory: string,
  toDirectory: string,
  settings?: Settings
): Promise<boolean> => {
  if (!settings) {
    settings = {
      defaultToRequired: false,
      schemaFileSuffix: 'Schema',
      debug: false
    };
  }
  if (!settings.schemaFileSuffix) {
    settings.schemaFileSuffix = 'Schema';
  }

  if (!fs.existsSync(fromDirectory)) {
    const resolvedFromDirectory = Path.resolve(fromDirectory);
    throw `fromDirectory "${resolvedFromDirectory}" does not exist`;
  }
  if (!fs.existsSync(toDirectory)) {
    const resolvedToDirectory = Path.resolve(toDirectory);
    throw `toDirectory "${resolvedToDirectory}" does not exist`;
  }

  // TODO:Possible new feature clear out toDirectory

  const fileNamesToExport: string[] = [];

  // Load files and get all interface records
  const files = fs.readdirSync(fromDirectory);
  for (const schemaFileName of files) {
    console.log(schemaFileName);
    const allInterfaceRecords: InterfaceRecord[] = [];
    const schemaFile = await require(Path.join(fromDirectory, schemaFileName));

    for (const iterator in schemaFile) {
      const joiSchema = schemaFile[iterator];

      if (!Joi.isSchema(joiSchema)) {
        continue;
      }
      const interfaceRecords = convertSchema(joiSchema);
      allInterfaceRecords.push(...interfaceRecords);
      console.log(iterator);
    }

    if (allInterfaceRecords.length === 0) {
      continue;
    }

    // Create Type File Name
    const typeFileName = schemaFileName.endsWith(`${settings.schemaFileSuffix}.ts`)
      ? schemaFileName.substring(0, schemaFileName.length - `${settings.schemaFileSuffix}.ts`.length)
      : schemaFileName;
    fileNamesToExport.push(typeFileName);

    // Clean up interface records list
    const interfacesToBeWritten: InterfaceRecord[] = [];
    interfacesToBeWritten.push(...allInterfaceRecords);

    // Write interfaces
    const interfaceContent = interfacesToBeWritten.map(interfaceToBeWritten => interfaceToBeWritten.content);

    fs.writeFileSync(Path.join(toDirectory, `${typeFileName}.ts`), interfaceContent.join('\n').concat('\n'));
  }

  // Write index.ts
  const exportLines = fileNamesToExport.map(fileName => `export * from './${fileName}';`);
  fs.writeFileSync(Path.join(toDirectory, 'index.ts'), exportLines.join('\n').concat('\n'));

  return true;
};
