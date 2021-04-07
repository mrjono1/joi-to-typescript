import Joi, { AnySchema } from 'joi';
import Path from 'path';

import { Settings, ConvertedType, GenerateTypeFile } from './types';
import { getTypeFileNameFromSchema } from './index';
import { Describe, getAllCustomTypes, parseSchema, typeContentToTs } from './parse';

export function convertSchemaInternal(
  settings: Settings,
  joi: AnySchema,
  exportedName?: string
): ConvertedType | undefined {
  const details = joi.describe() as Describe;
  const defaultName = details?.flags?.label || exportedName;

  if (!defaultName) {
    throw new Error(`At least one "object" does not have a .label(). Details: ${JSON.stringify(details)}`);
  }

  const name = settings.mapTypeName(defaultName);
  if (!name) {
    throw new Error(`Resulting type name cannot be empty. Default name was: ${defaultName}`);
  }

  if (settings.debug && name.toLowerCase().endsWith('schema')) {
    console.debug(
      `It is recommended you update the Joi Schema '${name}' similar to: ${name} = Joi.object().label('${name.replace(
        'Schema',
        ''
      )}')`
    );
  }

  // Set the label from the exportedName if missing
  if (!details.flags) {
    details.flags = { label: name };
  } else if (!details.flags.label) {
    // Unable to build any test cases for this line but will keep it if joi.describe() changes
    /* istanbul ignore next */
    details.flags.label = name;
  }

  const parsedSchema = parseSchema(details, settings, false);
  if (parsedSchema) {
    const customTypes = getAllCustomTypes(parsedSchema);
    const content = typeContentToTs(settings, parsedSchema, true);
    return {
      name,
      customTypes,
      content
    };
  }

  // The only type that could return this is alternatives
  // see parseAlternatives for why this is ignored
  /* istanbul ignore next */
  return undefined;
}
/**
 * Analyse a schema file
 *
 * @param settings - Settings
 * @param schemaFileName - Schema File Name
 * @returns Schema analysis results
 */
export async function analyseSchemaFile(
  settings: Settings,
  schemaFileName: string
): Promise<undefined | GenerateTypeFile> {
  const allConvertedTypes: ConvertedType[] = [];

  const fullFilePath = Path.resolve(Path.join(settings.schemaDirectory, schemaFileName));
  const schemaFile = await require(fullFilePath);

  // Create Type File Name
  const typeFileName = getTypeFileNameFromSchema(schemaFileName, settings);
  const fullOutputFilePath = Path.join(settings.typeOutputDirectory, typeFileName);

  for (const exportedName in schemaFile) {
    const joiSchema = schemaFile[exportedName];

    if (!Joi.isSchema(joiSchema)) {
      continue;
    }
    const convertedType = convertSchemaInternal(settings, joiSchema, exportedName);
    if (convertedType) {
      allConvertedTypes.push({ ...convertedType, location: fullOutputFilePath });
    }
  }

  if (allConvertedTypes.length === 0) {
    if (settings.debug) {
      console.debug(`${schemaFileName} - Skipped - no Joi Schemas found`);
    }
    return;
  }

  if (settings.debug) {
    console.debug(`${schemaFileName} - Processing`);
  }

  // Clean up type list
  // Sort Types
  const typesToBeWritten = allConvertedTypes.sort(
    (interface1, interface2) => 0 - (interface1.name > interface2.name ? -1 : 1)
  );

  // Write types
  const typeContent = typesToBeWritten.map(typeToBeWritten => typeToBeWritten.content);

  // Get imports for the current file
  const allExternalTypes: ConvertedType[] = [];
  const allCurrentFileTypeNames = typesToBeWritten.map(typeToBeWritten => typeToBeWritten.name);

  for (const typeToBeWritten of typesToBeWritten) {
    for (const customType of typeToBeWritten.customTypes) {
      if (!allCurrentFileTypeNames.includes(customType) && !allExternalTypes.includes(typeToBeWritten)) {
        allExternalTypes.push(typeToBeWritten);
      }
    }
  }

  const fileContent = `${typeContent.join('\n\n').concat('\n')}`;

  return {
    externalTypes: allExternalTypes,
    internalTypes: typesToBeWritten,
    fileContent,
    typeFileName,
    typeFileLocation: settings.typeOutputDirectory
  };
}
