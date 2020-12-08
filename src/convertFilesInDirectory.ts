import Path from 'path';
import fs from 'fs';
import { Settings, GenerateTypeFile, GenerateTypesDir } from './types';
import { getTypeFileNameFromSchema, writeIndexFile } from './index';
import { generateTypeFiles } from './generateTypeFiles';

/**
 * Create types from schemas from a directory
 * @param settings Settings
 */
export const convertFilesInDirectory = async (
  appSettings: Settings,
  ogTypeOutputDir: string,
  fileTypesToExport: GenerateTypeFile[] = []
): Promise<GenerateTypesDir> => {
  // Check and resolve directories
  appSettings.schemaDirectory = Path.resolve(appSettings.schemaDirectory);
  if (!fs.existsSync(appSettings.schemaDirectory)) {
    throw `schemaDirectory "${appSettings.schemaDirectory}" does not exist`;
  }
  appSettings.typeOutputDirectory = Path.resolve(appSettings.typeOutputDirectory);
  if (!fs.existsSync(appSettings.typeOutputDirectory)) {
    fs.mkdirSync(appSettings.typeOutputDirectory);
    if (!fs.existsSync(appSettings.typeOutputDirectory)) {
      throw `typeOutputDirectory "${appSettings.typeOutputDirectory}" does not exist`;
    }
  }

  let fileNamesToExport: string[] = [];
  const currentDirFileTypesToExport: GenerateTypeFile[] = fileTypesToExport;

  // Load files and get all types
  const files = fs.readdirSync(appSettings.schemaDirectory);
  for (const schemaFileName of files) {
    const subDirectoryPath = Path.join(appSettings.schemaDirectory, schemaFileName);
    if (
      !appSettings.rootDirectoyOnly &&
      !appSettings.rootDirectoyOnly &&
      fs.lstatSync(subDirectoryPath).isDirectory()
    ) {
      const typeOutputDirectory = appSettings.flattenTree
        ? appSettings.typeOutputDirectory
        : Path.join(appSettings.typeOutputDirectory, schemaFileName);

      const thisDirsFileNamesToExport = await convertFilesInDirectory(
        {
          ...appSettings,
          schemaDirectory: subDirectoryPath,
          typeOutputDirectory
        },
        ogTypeOutputDir,
        currentDirFileTypesToExport
      );

      if (appSettings.indexAllToRoot || appSettings.flattenTree) {
        fileNamesToExport = fileNamesToExport.concat(thisDirsFileNamesToExport.typeFileNames);
      }
    } else {
      const exportType = await generateTypeFiles(appSettings, schemaFileName);
      if (exportType) {
        let dirTypeFileName = exportType.typeFileName;
        if (appSettings.indexAllToRoot) {
          const findIndexEnd =
            Path.resolve(appSettings.typeOutputDirectory).indexOf(ogTypeOutputDir) + ogTypeOutputDir.length + 1;
          dirTypeFileName = Path.join(
            appSettings.typeOutputDirectory.substring(findIndexEnd),
            getTypeFileNameFromSchema(schemaFileName, appSettings)
          );
        }
        fileNamesToExport.push(dirTypeFileName);
        currentDirFileTypesToExport.push(exportType);
      }
    }
  }

  if (!appSettings.indexAllToRoot && !appSettings.flattenTree) {
    // Write index.ts
    writeIndexFile(appSettings, fileNamesToExport);
  }

  return { typeFileNames: fileNamesToExport, types: currentDirFileTypesToExport };
};
