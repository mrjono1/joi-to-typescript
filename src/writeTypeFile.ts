import Path from 'path';
import fs from 'fs';
import { Settings, GenerateTypeFile } from './types';

/**
 * Write type file
 * @param settings Settings
 * @param schemaFileName Schema File Name
 */
export const writeTypeFile = async (
  settings: Settings,
  typeFileName: string,
  generatedTypes: GenerateTypeFile[]
): Promise<undefined | string> => {
  const generatedFile = generatedTypes.find(x => x.typeFileName === typeFileName);
  if (generatedFile && generatedFile.fileContent && generatedFile.typeFileName) {
    let typeImports = '';
    if (settings.flattenTree) {
      const externalTypeNames = generatedFile.externalTypes.map(typeToBeWritten => typeToBeWritten.customTypes).flat();
      typeImports = externalTypeNames.length == 0 ? '' : `import { ${externalTypeNames.join(', ')} } from '.';\n\n`;
    } else {
      const customTypeLocationDict: { [id: string]: string[] } = {};
      for (const externalCustomType of generatedFile.externalTypes
        .map(x => x.customTypes)
        .flat()
        .filter((value, index, self) => {
          // Remove Duplicates
          return self.indexOf(value) === index;
        })) {
        if (settings.indexAllToRoot) {
          if (!customTypeLocationDict[settings.typeOutputDirectory]) {
            customTypeLocationDict[settings.typeOutputDirectory] = [];
          }

          if (!customTypeLocationDict[settings.typeOutputDirectory].includes(externalCustomType)) {
            customTypeLocationDict[settings.typeOutputDirectory].push(externalCustomType);
          }
        } else {
          for (const generatedInternalType of generatedTypes
            .filter(f => f.typeFileName !== typeFileName)
            .map(x => x.internalTypes)
            .flat()
            .filter((value, index, self) => {
              return value.name === externalCustomType && self.indexOf(value) === index;
            })) {
            if (generatedInternalType && generatedInternalType.location) {
              if (!customTypeLocationDict[Path.dirname(generatedInternalType.location)]) {
                customTypeLocationDict[Path.dirname(generatedInternalType.location)] = [];
              }

              if (!customTypeLocationDict[Path.dirname(generatedInternalType.location)].includes(externalCustomType)) {
                customTypeLocationDict[Path.dirname(generatedInternalType.location)].push(externalCustomType);
              }
            }
          }
        }
      }

      for (const customTypeLocation in customTypeLocationDict) {
        let relativePath = Path.relative(generatedFile.typeFileLocation, customTypeLocation);
        relativePath = relativePath ? `${relativePath}` : '.';
        relativePath = relativePath.includes('..') || relativePath == '.' ? relativePath : `./${relativePath}`;
        typeImports += `import { ${customTypeLocationDict[customTypeLocation].join(', ')} } from '${relativePath.replace(/\\/g, '/')}';\n`;
      }

      if (typeImports) {
        typeImports += `\n`;
      }
    }

    const fileContent = `${settings.fileHeader}\n\n${typeImports}${generatedFile.fileContent}`;
    fs.writeFileSync(
      `${Path.join(
        settings.flattenTree ? settings.typeOutputDirectory : generatedFile.typeFileLocation,
        typeFileName
      )}.ts`,
      fileContent
    );
    return generatedFile.typeFileName;
  }

  return undefined;
};
