# joi-ts-types

Convert [Joi](https://github.com/sideway/joi) Schemas to TypeScript interfaces

This will allow you to reuse a Joi Schema that validates your [Hapi](https://github.com/hapijs/hapi) API to generate TypeScript interfaces saving you time.

Important note: this has been built for `"joi": "^17.2.1"` and will probaly not work for older versions

## Suggested Usage

1. Create a Schemas Folder eg. `src/schemas`
1. Create a Types Folder eg. `src/types`
1. Create Joi Schemas in the Schemas folder with a file name suffix of Schemas eg. `AddressSchema.ts`
   1. The file name suffix ensures that type files and schema file imports are not confusing
1.

## Example Schema

```typescript
import Joi from 'joi';

export const PersonSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required()
}).label('Person');
```

### Points of Interest

- `export const PersonSchema` schema must be exported
- `export const PersonSchema` schema includes a suffix of Schema
- `.label('Person');` required for this library and is used as the `interface` name

## Settings

```typescript
export interface Settings {
  /**
   * The input/schema directory
   */
  schemaDirectory: string;
  /**
   * The output/interface directory
   */
  interfaceDirectory: string;
  /**
   * Should interface properties be defaulted to optional or required
   */
  defaultToRequired?: boolean;
  /**
   * What schema file name suffix will be removed when creating the interface file name
   * Defaults to `Schema`
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

## Possible features

- Convert sub schemas to interfaces
- Ability to add your own custom types
- Clear `toDirectory` to ensure there is no junk files
