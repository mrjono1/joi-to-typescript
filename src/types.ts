/**
 * Application settings
 */
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
  defaultToRequired: boolean;
  /**
   * What schema file name suffix will be removed when creating the interface file name
   * Defaults to `Schema`
   */
  schemaFileSuffix: string;
  /**
   * If `true` the console will include more information
   */
  debug: boolean;
  /**
   * File Header content for generated files
   */
  fileHeader: string;
  /**
   * If true will sort properties on interface by name
   */
  sortPropertiesByName: boolean;
}

export interface InterfaceRecord {
  name: string;
  content: string;
  customTypes: string[];
}

export interface BaseTypeContent {
  /**
   * Interface, property, or type name (from label or key name)
   */
  name?: string;

  /**
   * will add this to the jsDoc output
   */
  description?: string;

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
  name,
  description
}: Omit<TypeContentChild, '__isRoot'>): TypeContentChild {
  return {
    __isRoot: false,
    content,
    customTypes,
    required,
    name,
    description
  };
}

export function makeTypeContentRoot({
  joinOperation,
  name,
  children,
  required,
  description
}: Omit<TypeContentRoot, '__isRoot'>): TypeContentRoot {
  return {
    __isRoot: true,
    joinOperation,
    name,
    children,
    required,
    description
  };
}

/**
 * Holds information for conversion to ts
 */
export type TypeContent = TypeContentRoot | TypeContentChild;

/**
 * Basic info on a joi schema
 */
export interface BasicJoiType {
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

export interface Property extends BasicJoiType {
  /**
   * The object key this schema was stored under
   */
  name: string;
}

export interface PropertiesAndInterfaces {
  properties: Property[];
  interfaces: InterfaceRecord[];
}
