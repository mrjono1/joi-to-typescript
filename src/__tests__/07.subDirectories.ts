import { convertFromDirectory } from '../index';
import { readFileSync, rmdirSync } from 'fs';
import { AssertionCriteria } from './07/AssertionCriteria';

describe('07. subDirectories', () => {
  const typeOutputDirectory = './src/__tests__/07/models';
  const schemaDirectory = './src/__tests__/07/schemas';

  beforeAll(() => {
    rmdirSync(typeOutputDirectory, { recursive: true });
  });

  // test('Sub-Directory - Defaults [Tree]', async () => {
  //   const result = await convertFromDirectory({
  //     schemaDirectory,
  //     typeOutputDirectory
  //   });

  //   expect(result).toBe(true);

  //   const rootIndexContent = readFileSync(`${typeOutputDirectory}/index.ts`).toString();
  //   const oneContent = readFileSync(`${typeOutputDirectory}/One.ts`).toString();
  //   const subDirIndexContent = readFileSync(`${typeOutputDirectory}/index.ts`).toString();
  //   const personContent = readFileSync(`${typeOutputDirectory}/subDir/Person.ts`).toString();

  //   expect(rootIndexContent).toBe(AssertionCriteria.defaultRootIndexContent);
  //   expect(oneContent).toBe(AssertionCriteria.oneContentTree);
  //   expect(subDirIndexContent).toBe(AssertionCriteria.subDirIndexContent);
  //   expect(personContent).toBe(AssertionCriteria.personContent);
  // });

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

    expect(rootIndexContent).toBe(AssertionCriteria.flattenedRootIndexContent);
    expect(oneContent).toBe(AssertionCriteria.oneContentFlatOrIndexAll);
    expect(personContent).toBe(AssertionCriteria.personContent);
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

    expect(rootIndexContent).toBe(AssertionCriteria.indexAllToRootIndexContent);
    expect(oneContent).toBe(AssertionCriteria.oneContentFlatOrIndexAll);
    expect(personContent).toBe(AssertionCriteria.personContent);
  });
});
