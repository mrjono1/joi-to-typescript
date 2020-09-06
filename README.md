# joi-to-typescript

[![NPM version][npm-image]][npm-url] ![Latest Build](https://github.com/mrjono1/joi-to-typescript/workflows/Node.js%20CI/badge.svg) ![NPM Release Build](https://github.com/mrjono1/joi-to-typescript/workflows/Node.js%20Package/badge.svg) ![GitHub top language](https://img.shields.io/github/languages/top/mrjono1/joi-to-typescript)

[joi-to-typescript on GitHub](https://github.com/mrjono1/joi-to-typescript)

[npm-image]: https://img.shields.io/npm/v/joi-to-typescript.svg?style=flat
[npm-url]: https://www.npmjs.com/package/joi-to-typescript

Convert [Joi](https://github.com/sideway/joi) Schemas to TypeScript interfaces

This will allow you to reuse a Joi Schema that validates your [Hapi](https://github.com/hapijs/hapi) API to generate TypeScript interfaces saving you time.

## Important

- This has been built for `"joi": "^17.2.1"` and will probaly not work for older versions
- Minimum node version 12 as Joi requries node 12

## Suggested Usage

1. Create a Schemas Folder eg. `src/schemas`
1. Create a Types Folder eg. `src/types`
1. Create Joi Schemas in the Schemas folder with a file name suffix of Schemas eg. `AddressSchema.ts`
   - The file name suffix ensures that type file and schema file imports are not confusing

## Example Usage

#### Example Schema in src/schemas

```typescript
import Joi from 'joi';

export const PersonSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required()
}).label('Person');
```

##### Points of Interest

- `export const PersonSchema` schema must be exported
- `export const PersonSchema` schema includes a suffix of Schema
- `.label('Person');` required for this library and is used as the `interface` name

#### Example Call

```typescript
import { convertFromDirectory } from 'joi-to-typescript';

convertFromDirectory({
  schemaDirectory: './src/schemas',
  interfaceDirectory: './src/types',
  debug: true
});
```

## Settings

```typescript
export interface Settings {
  /**
   * The input/schema directory
   * Directory must exist
   */
  schemaDirectory: string;
  /**
   * The output/interface directory
   * Will also attempt to create this directory
   */
  interfaceDirectory: string;
  /**
   * Should interface properties be defaulted to optional or required
   */
  defaultToRequired?: boolean;
  /**
   * What schema file name suffix will be removed when creating the interface file name
   * Defaults to `Schema`
   * This ensures that an interface and Schema with the file name are not confused
   */
  schemaFileSuffix?: string;
  /**
   * If `true` the console will include more information
   */
  debug?: boolean;
  /**
   * File Header content for generated files
   */
  fileHeader?: string;
}
```

## Joi Features Supported

- .label('InterfaceName') - interface Name and in jsDoc
- .description('What this interface is for') - jsdoc
- .valid(['red', 'green', 'blue']) - enumerations
- .optional() - optional properties `?`
- .requried() - required properties
- .array(), .object(), .string(), .number(), .boolean() - standard Joi schemas

Joi Features not listed here will be ignored

## TODO

- Increase test quality and quantity
- Support `null` fields
- Convert sub schemas to interfaces
- Ability to add your own custom types
- Clear `interfaceDirectory` to ensure there is no junk files
