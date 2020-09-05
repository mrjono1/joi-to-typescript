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

export interface InterfaceRecord {
  name: string;
  content: string;
  customTypes: string[];
  //fileName?: string;
}

export interface Property {
  name: string;
  type: string;
  customType?: string;
  content: string;
}

export interface PropertiesAndInterfaces {
  properties: Property[];
  interfaces: InterfaceRecord[];
}
