import { readFileSync, rmdirSync } from 'fs';

import { convertFromDirectory } from '../../index';
import { AssertionCriteria } from './AssertionCriteria';

describe('subDirectories', () => {
  const typeOutputDirectory = './src/__tests__/subDirectories/models';
  const schemaDirectory = './src/__tests__/subDirectories/schemas';

  beforeEach(() => {
    rmdirSync(typeOutputDirectory, { recursive: true });
  });

  test('Sub-Directory - Defaults [Tree]', async () => {
    const result = await convertFromDirectory({
      schemaDirectory,
      typeOutputDirectory
    });

    expect(result).toBe(true);

    const rootIndexContent = readFileSync(`${typeOutputDirectory}/index.ts`).toString();
    const oneContent = readFileSync(`${typeOutputDirectory}/One.ts`).toString();
    const subDirIndexContent = readFileSync(`${typeOutputDirectory}/subDir/index.ts`).toString();
    const personContent = readFileSync(`${typeOutputDirectory}/subDir/Person.ts`).toString();
    const addressContent = readFileSync(`${typeOutputDirectory}/subDir/Address.ts`).toString();
    const subDir2IndexContent = readFileSync(`${typeOutputDirectory}/subDir2/index.ts`).toString();
    const employeeContent = readFileSync(`${typeOutputDirectory}/subDir2/Employee.ts`).toString();

    expect(rootIndexContent).toBe(AssertionCriteria.defaultRootIndexContent);
    expect(oneContent).toBe(AssertionCriteria.oneContentTree);
    expect(subDirIndexContent).toBe(AssertionCriteria.subDirIndexContent);
    expect(personContent).toBe(AssertionCriteria.personContentTree);
    expect(addressContent).toBe(AssertionCriteria.addressContent);
    expect(subDir2IndexContent).toBe(AssertionCriteria.subDir2IndexContent);
    expect(employeeContent).toBe(AssertionCriteria.employeeContentTree);
  });

  test('Sub-Directory - Flatten', async () => {
    rmdirSync(typeOutputDirectory, { recursive: true });
    const result = await convertFromDirectory({
      schemaDirectory,
      typeOutputDirectory,
      flattenTree: true
    });

    expect(result).toBe(true);

    const rootIndexContent = readFileSync(`${typeOutputDirectory}/index.ts`).toString();
    const oneContent = readFileSync(`${typeOutputDirectory}/One.ts`).toString();
    const personContent = readFileSync(`${typeOutputDirectory}/Person.ts`).toString();
    const addressContent = readFileSync(`${typeOutputDirectory}/Address.ts`).toString();
    const employeeContent = readFileSync(`${typeOutputDirectory}/Employee.ts`).toString();

    expect(rootIndexContent).toBe(AssertionCriteria.flattenedRootIndexContent);
    expect(oneContent).toBe(AssertionCriteria.oneContentFlatOrIndexAll);
    expect(personContent).toBe(AssertionCriteria.personContentTree);
    expect(addressContent).toBe(AssertionCriteria.addressContent);
    expect(employeeContent).toBe(AssertionCriteria.employeeContentFlattened);
  });

  test('Sub-Directory - Tree Index All to Root', async () => {
    const result = await convertFromDirectory({
      schemaDirectory,
      typeOutputDirectory,
      indexAllToRoot: true
    });

    expect(result).toBe(true);

    const rootIndexContent = readFileSync(`${typeOutputDirectory}/index.ts`).toString();
    const oneContent = readFileSync(`${typeOutputDirectory}/One.ts`).toString();
    const personContent = readFileSync(`${typeOutputDirectory}/subDir/Person.ts`).toString();
    const addressContent = readFileSync(`${typeOutputDirectory}/subDir/Address.ts`).toString();
    const employeeContent = readFileSync(`${typeOutputDirectory}/subDir2/Employee.ts`).toString();

    expect(rootIndexContent).toBe(AssertionCriteria.indexAllToRootIndexContent);
    expect(oneContent).toBe(AssertionCriteria.oneContentFlatOrIndexAll);
    expect(personContent).toBe(AssertionCriteria.personRootIndexContent);
    expect(addressContent).toBe(AssertionCriteria.addressContent);
    expect(employeeContent).toBe(AssertionCriteria.employeeRootIndexContent);
  });

  test('Sub-Directory - Root Directory Only', async () => {
    const result = await convertFromDirectory({
      schemaDirectory: schemaDirectory + '/subDir', // Need to choose a directory with schemas that don't contain outer/sub dependencies.
      typeOutputDirectory,
      rootDirectoryOnly: true
    });

    expect(result).toBe(true);

    const rootIndexContent = readFileSync(`${typeOutputDirectory}/index.ts`).toString();
    const addressContent = readFileSync(`${typeOutputDirectory}/Address.ts`).toString();

    expect(rootIndexContent).toBe(AssertionCriteria.subDirIndexContent);
    expect(addressContent).toBe(AssertionCriteria.addressContent);
  });
});
