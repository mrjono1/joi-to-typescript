import Joi from 'joi';
import Path from 'path';

import { Settings, ConvertedType, GenerateTypeFile } from './types';
import { convertSchema, getTypeFileNameFromSchema } from './index';

/**
 * Analyse a schema file
 *
 * @param settings - Settings
 * @param schemaFileName - Schema File Name
 * @returns Schema analysis results
 */
export const analyseSchemaFile = async (
  settings: Settings,
  schemaFileName: string
): Promise<undefined | GenerateTypeFile> => {
  const allConvertedTypes: ConvertedType[] = [];

  const fullFilePath = Path.join(settings.schemaDirectory, schemaFileName);
  const schemaFile = await require(fullFilePath);

  // Create Type File Name
  const typeFileName = getTypeFileNameFromSchema(schemaFileName, settings);
  const fullOutputFilePath = Path.join(settings.typeOutputDirectory, typeFileName);

  for (const exportedName in schemaFile) {
    const joiSchema = schemaFile[exportedName];

    if (!Joi.isSchema(joiSchema)) {
      continue;
    }
    const convertedType = convertSchema(settings, joiSchema, exportedName);
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
};
