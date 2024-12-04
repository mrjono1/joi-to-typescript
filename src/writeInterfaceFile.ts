import Path from 'path';
import { writeFileSync } from 'fs';

import { Settings, GenerateTypeFile } from './types';

/**
 * Write interface file
 *
 * @returns The written file name
 */
export async function writeInterfaceFile(
  settings: Settings,
  typeFileName: string,
  generatedTypes: GenerateTypeFile[]
): Promise<undefined | string> {
  const generatedFile = generatedTypes.find(x => x.typeFileName === typeFileName);
  if (generatedFile && generatedFile.fileContent && generatedFile.typeFileName) {
    let typeImports = '';
    if (settings.flattenTree) {
      const externalTypeNames = generatedFile.externalTypes.map(typeToBeWritten => typeToBeWritten.customTypes).flat();
      typeImports = externalTypeNames.length === 0 ? '' : `import { ${externalTypeNames.join(', ')} } from '.';\n\n`;
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
              return value.interfaceOrTypeName === externalCustomType && self.indexOf(value) === index;
            })) {
            if (generatedInternalType && generatedInternalType.location) {
              const generatedInternalTypeLocation = settings.omitIndexFiles
                ? // When we don't want to generate index files it means we need to directly refer
                  // to each individually generated file
                  generatedInternalType.location
                : // Otherwise it's ok to refer to the output directory's path
                  Path.dirname(generatedInternalType.location);
              if (!customTypeLocationDict[generatedInternalTypeLocation]) {
                customTypeLocationDict[generatedInternalTypeLocation] = [];
              }

              if (!customTypeLocationDict[generatedInternalTypeLocation].includes(externalCustomType)) {
                customTypeLocationDict[generatedInternalTypeLocation].push(externalCustomType);
              }
            }
          }
        }
      }

      for (const customTypeLocation in customTypeLocationDict) {
        let relativePath = Path.relative(generatedFile.typeFileLocation, customTypeLocation);
        relativePath = relativePath ? `${relativePath}` : '.';
        relativePath = relativePath.includes('..') || relativePath === '.' ? relativePath : `./${relativePath}`;
        typeImports += `import { ${customTypeLocationDict[customTypeLocation].join(
          ', '
        )} } from '${relativePath.replace(/\\/g, '/')}';\n`;
      }

      if (typeImports) {
        typeImports += `\n`;
      }
    }

    const fileContent = `${settings.fileHeader}\n\n${typeImports}${generatedFile.fileContent}`;
    writeFileSync(
      `${Path.join(
        settings.flattenTree ? settings.typeOutputDirectory : generatedFile.typeFileLocation,
        typeFileName
      )}.ts`,
      fileContent
    );
    return generatedFile.typeFileName;
  }

  // This function is intended to only be called by `convertFromDirectory` where the input
  // data is checked before calling this function
  /* istanbul ignore next */
  return undefined;
}
