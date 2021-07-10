/**
 * Application settings
 */
export interface Settings {
  /**
   * The input/schema directory
   * Directory must exist
   */
  readonly schemaDirectory: string;
  /**
   * The output/type directory
   * Will also attempt to create this directory
   */
  readonly typeOutputDirectory: string;
  /**
   * Use .label('InterfaceName') instead of .meta({className:'InterfaceName'}) for interface names
   */
  readonly useLabelAsInterfaceName: boolean;
  /**
   * Should interface properties be defaulted to optional or required
   * @default false
   */
  readonly defaultToRequired: boolean;
  /**
   * What schema file name suffix will be removed when creating the interface file name
   * @default "Schema"
   * This ensures that an interface and Schema with the file name are not confused
   */
  readonly schemaFileSuffix: string;
  /**
   * If `true` the console will include more information
   * @default false
   */
  readonly debug: boolean;
  /**
   * File Header content for generated files
   */
  readonly fileHeader: string;
  /**
   * If true will sort properties on interface by name
   * @default true
   */
  readonly sortPropertiesByName: boolean;
  /**
   * If true will not output to subDirectories in output/interface directory. It will flatten the structure.
   */
  readonly flattenTree: boolean;
  /**
   * If true will only read the files in the root directory of the input/schema directory. Will not parse through sub-directories.
   */
  readonly rootDirectoryOnly: boolean;
  /**
   * If true will write all exports *'s to root index.ts in output/interface directory.
   */
  readonly indexAllToRoot: boolean;
  /**
   * Comment every interface and property even with just a duplicate of the interface and property name
   * @default false
   */
  readonly commentEverything: boolean;
  /**
   * List of files or folders that should be ignored from conversion. These can either be
   * filenames (AddressSchema.ts) or filepaths postfixed with a / (addressSchemas/)
   * @default []
   */
  readonly ignoreFiles: string[];
  /**
   * If true will ignore `index.ts` files in the input/schema directory.
   * @default false
   */
  readonly ignoreIndexFiles: boolean;
  /**
   * The indentation characters
   * @default '  ' (two spaces)
   */
  readonly indentationChacters: string;
}

export interface ConvertedType {
  interfaceOrTypeName: string;
  content: string;
  customTypes: string[];
  location?: string;
}

export interface BaseTypeContent {
  /**
   * Interface name or type name (from id/label or key name)
   */
  interfaceOrTypeName?: string;

  /**
   * will add this to the jsDoc output
   */
  jsDoc?: JsDoc;

  /**
   * If this is an object property is it required
   */
  required?: boolean;
}

/**
 * Holds multiple TypeContents that will be joined together
 */
export interface TypeContentRoot extends BaseTypeContent {
  __isRoot: true;
  /**
   * How to join the children types together
   */
  joinOperation: 'list' | 'union' | 'intersection' | 'object';

  /**
   * Children types
   */
  children: TypeContent[];
}

/**
 * A single type
 */
export interface TypeContentChild extends BaseTypeContent {
  __isRoot: false;

  /**
   * Other non-basic schemas referenced in this type
   */
  customTypes?: string[];

  /**
   * The typescript result ex: string, 'literalString', 42, SomeTypeName
   */
  content: string;
}

export function makeTypeContentChild({
  content,
  customTypes,
  required,
  interfaceOrTypeName,
  jsDoc
}: Omit<TypeContentChild, '__isRoot'>): TypeContentChild {
  return {
    __isRoot: false,
    content,
    customTypes,
    required,
    interfaceOrTypeName,
    jsDoc
  };
}

export function makeTypeContentRoot({
  joinOperation,
  interfaceOrTypeName,
  children,
  required,
  jsDoc
}: Omit<TypeContentRoot, '__isRoot'>): TypeContentRoot {
  return {
    __isRoot: true,
    joinOperation,
    interfaceOrTypeName,
    children,
    required,
    jsDoc
  };
}

/**
 * Holds information for conversion to ts
 */
export type TypeContent = TypeContentRoot | TypeContentChild;

export interface Property {
  /**
   * The object key this schema was stored under
   */
  name: string;
  /**
   * number, string literals, Joi.label, etc
   */
  type: string;
  /**
   * Other schemas referenced in this schema
   */
  customTypes?: string[];
  /**
   * The typescript result
   */
  content: string;
}

export interface GenerateTypeFile {
  /**
   * External Types required by File
   */
  externalTypes: ConvertedType[];
  /**
   * Internal Types provided by File
   */
  internalTypes: ConvertedType[];
  /**
   * Contents of file exported.
   */
  fileContent: string;
  /**
   * File Name of file exported.
   */
  typeFileName: string;

  /**
   * File Location of where file is exported.
   */
  typeFileLocation: string;
}

export interface GenerateTypesDir {
  /**
   * Types generated in Directory/SubDirectory
   */
  types: GenerateTypeFile[];
  /**
   * FileNames of files exported.
   */
  typeFileNames: string[];
}

export interface JsDoc {
  /**
   * description value
   */
  description?: string;
  /**
   * @example example value
   */
  example?: string;
}
