// Functions for converting properties to strings and to file system
// TODO: Move all code here

import { writeFileSync } from 'fs';
import Path from 'path';

import { JsDoc, Settings } from './types';

/**
 * Write index.ts file
 *
 * @param settings - Settings Object
 * @param fileNamesToExport - List of file names that will be added to the index.ts file
 */
export function writeIndexFile(settings: Settings, fileNamesToExport: string[]): void {
  if (fileNamesToExport.length === 0) {
    // Don't write an index file if its going to export nothing
    return;
  }
  const exportLines = fileNamesToExport.map(fileName => `export * from './${fileName.replace(/\\/g, '/')}';`);
  const fileContent = `${settings.fileHeader}\n\n${exportLines.join('\n').concat('\n')}`;
  writeFileSync(Path.join(settings.typeOutputDirectory, 'index.ts'), fileContent);
}

export function getTypeFileNameFromSchema(schemaFileName: string, settings: Settings): string {
  return (
    (schemaFileName.endsWith(`${settings.schemaFileSuffix}.ts`)
      ? schemaFileName.substring(0, schemaFileName.length - `${settings.schemaFileSuffix}.ts`.length)
      : schemaFileName.replace('.ts', '')) + settings.interfaceFileSuffix
  );
}

/**
 * Get all indent characters for this indent level
 * @param settings includes what the indent characters are
 * @param indentLevel how many indent levels
 */
export function getIndentStr(settings: Settings, indentLevel: number): string {
  return settings.indentationChacters.repeat(indentLevel);
}

/**
 * Get Interface jsDoc
 */
export function getJsDocString(settings: Settings, name: string, jsDoc?: JsDoc, indentLevel = 0): string {
  if (jsDoc?.disable == true) {
    return '';
  }

  if (!settings.commentEverything && !jsDoc?.description && !jsDoc?.example) {
    return '';
  }

  const lines = ['/**'];

  if (settings.commentEverything || (jsDoc && jsDoc.description)) {
    let description = name;
    if (jsDoc?.description) {
      description = jsDoc.description.trim();
    }
    lines.push(...description.split('\n').map(line => ` * ${line}`.trimEnd()));
  }

  if (jsDoc?.example) {
    lines.push(` * @example ${jsDoc.example}`);
  }

  lines.push(' */');
  return lines.map(line => `${getIndentStr(settings, indentLevel)}${line}`).join('\n') + '\n';
}
