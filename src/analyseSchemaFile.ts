import Joi, { AnySchema } from 'joi';
import Path from 'path';

import { Settings, ConvertedType, GenerateTypeFile } from './types';
import { getTypeFileNameFromSchema } from './write';
import { getAllCustomTypes, parseSchema, typeContentToTs } from './parse';
import { Describe } from './joiDescribeTypes';
import { ensureInterfaceorTypeName, getInterfaceOrTypeName } from './joiUtils';

export function convertSchemaInternal(
  settings: Settings,
  joi: AnySchema,
  exportedName?: string,
  rootSchema?: boolean
): ConvertedType | undefined {
  const details = joi.describe() as Describe;

  const interfaceOrTypeName = getInterfaceOrTypeName(settings, details) || exportedName;

  if (!interfaceOrTypeName) {
    if (settings.useLabelAsInterfaceName) {
      throw new Error(`At least one "object" does not have .label(''). Details: ${JSON.stringify(details)}`);
    } else {
      throw new Error(`At least one "object" does not have .meta({className:''}). Details: ${JSON.stringify(details)}`);
    }
  }

  if (settings.debug && interfaceOrTypeName.toLowerCase().endsWith('schema')) {
    if (settings.useLabelAsInterfaceName) {
      // eslint-disable-next-line no-console
      console.debug(
        `It is recommended you update the Joi Schema '${interfaceOrTypeName}' similar to: ${interfaceOrTypeName} = Joi.object().label('${interfaceOrTypeName.replace(
          'Schema',
          ''
        )}')`
      );
    } else {
      // eslint-disable-next-line no-console
      console.debug(
        `It is recommended you update the Joi Schema '${interfaceOrTypeName}' similar to: ${interfaceOrTypeName} = Joi.object().meta({className:'${interfaceOrTypeName.replace(
          'Schema',
          ''
        )}'})`
      );
    }
  }

  ensureInterfaceorTypeName(settings, details, interfaceOrTypeName);

  const parsedSchema = parseSchema(details, settings, false, undefined, rootSchema);
  if (parsedSchema) {
    const customTypes = getAllCustomTypes(parsedSchema);
    const content = typeContentToTs(settings, parsedSchema, true);
    return {
      schema: joi,
      interfaceOrTypeName,
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
  const schemaFile = await import(fullFilePath);

  // Create Type File Name
  const typeFileName = getTypeFileNameFromSchema(schemaFileName, settings);
  const fullOutputFilePath = Path.join(settings.typeOutputDirectory, typeFileName);

  for (const exportedName in schemaFile) {
    const joiSchema = schemaFile[exportedName];

    if (!Joi.isSchema(joiSchema)) {
      continue;
    }
    const convertedType = convertSchemaInternal(settings, joiSchema, exportedName, true);
    if (convertedType) {
      allConvertedTypes.push({ ...convertedType, location: fullOutputFilePath });
    }
  }

  if (allConvertedTypes.length === 0) {
    if (settings.debug) {
      // eslint-disable-next-line no-console
      console.debug(`${schemaFileName} - Skipped - no Joi Schemas found`);
    }
    return;
  }

  if (settings.debug) {
    // eslint-disable-next-line no-console
    console.debug(`${schemaFileName} - Processing`);
  }

  // Clean up type list
  // Sort Types
  const typesToBeWritten = allConvertedTypes.sort(
    (interface1, interface2) => 0 - (interface1.interfaceOrTypeName > interface2.interfaceOrTypeName ? -1 : 1)
  );

  // Write types
  const typeContent = typesToBeWritten.map(typeToBeWritten => {
    const content = typeToBeWritten.content;
    return [
      ...(settings.tsContentHeader ? [settings.tsContentHeader(typeToBeWritten)] : []),
      content,
      ...(settings.tsContentFooter ? [settings.tsContentFooter(typeToBeWritten)] : [])
    ].join('\n');
  });

  // Get imports for the current file
  const allExternalTypes: ConvertedType[] = [];
  const allCurrentFileTypeNames = typesToBeWritten.map(typeToBeWritten => typeToBeWritten.interfaceOrTypeName);

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
