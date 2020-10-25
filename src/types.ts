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
}

export interface InterfaceRecord {
  name: string;
  content: string;
  customTypes: string[];
}

export interface TypeContentRoot {
  __isRoot: true;
  /**
   * How to join the children types together
   */
  joinOperation: 'list' | 'union' | 'intersection' | 'object';
  /**
   * Interface, property, or type name
   */
  name: string;

  /**
   * Children types
   */
  children?: TypeContent[];
}

export interface TypeContentChild {
  __isRoot: false;

  /**
   * Other non-basic schemas referenced in this type
   */
  customTypes?: string[];
  /**
   * The typescript result
   */
  content?: string;
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
