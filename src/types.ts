export interface Settings {
  defaultToRequired: boolean;
  schemaFileSuffix?: string;
  debug?: boolean;
}
export interface InterfaceRecord {
  name: string;
  content: string;
  fileName?: string;
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
