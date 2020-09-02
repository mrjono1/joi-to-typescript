import { ObjectSchema } from "joi";

export interface InterfaceRecord {
  name: string;
  content: string;
  fileName?: string;
}

export const convertObject = (joi: ObjectSchema): InterfaceRecord[] => {
  console.log(joi);

  const types: InterfaceRecord[] = [];

  const name = getLabel(joi);
  if (!name) {
    throw 'At least one "object" does not have a .label()';
  }

  types.push({
    name,
    content: `${getInterfaceJsDoc(joi)}
export interface ${name} {

}`,
  });

  return types;
};

/**
 * Get Interface jsDoc
 */
export const getInterfaceJsDoc = (joi: ObjectSchema): string => {
  const name = getLabel(joi);
  const description = getDescription(joi);

  if (description) {
    return `/**
 * ${name}
 * ${description}
 */`;
  } else {
    return `/**
 * ${name}
 */`;
  }
};
export const getLabel = (joi: ObjectSchema): undefined | string => {
  return joi?._flags?.label;
};

export const getDescription = (joi: ObjectSchema): undefined | string => {
  return joi?._flags?.description;
};
