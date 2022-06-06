import { existsSync, readFileSync, rmdirSync } from 'fs';
import { convertFromDirectory } from '../..';

describe('test the use of joi.concat()', () => {
  const typeOutputDirectory = './src/__tests__/concat/interfaces';
  const schemaDirectory = './src/__tests__/concat/schemas';

  beforeAll(() => {
    if (existsSync(typeOutputDirectory)) {
      rmdirSync(typeOutputDirectory, { recursive: true });
    }
  });

  test('generate className interfaces', async () => {
    const result = await convertFromDirectory({
      schemaDirectory,
      typeOutputDirectory,
      debug: true
    });

    expect(result).toBe(true);

    expect(existsSync(`${typeOutputDirectory}/index.ts`)).toBeTruthy();
  });

  // it would be nice to auto remove this schema suffix but that could break the Joi, the safest is to warn the user about
  // how they could do it better
  test('no className with schema as suffix', () => {
    const oneContent = readFileSync(`${typeOutputDirectory}/FooBar.ts`).toString();

    expect(oneContent).toBe(
      `/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface Bar {
  b?: string;
}

export interface Foo {
  a?: string;
}

export interface FooBar {
  a?: string;
  b?: string;
}
`
    );
  });
});
