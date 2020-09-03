import { ObjectSchema } from "joi";

/**
 * This file is for interpreting the Joi Object Model
 */

/**
 * Get an object Label
 * @param joi Joi Object
 */
export const getLabel = (joi: ObjectSchema): undefined | string => {
  return joi?._flags?.label;
};

export const getDescription = (joi: ObjectSchema): undefined | string => {
  return joi?._flags?.description;
};

interface JoiProperty {
  key: string;
  schema: {
    type: string;
    _flags?: {
      presence?: "optional" | "required";
    };
  };
}

export const getRequired = (property: JoiProperty): undefined | boolean => {
  let required: undefined | boolean = undefined;
  if (property.schema._flags?.presence) {
    if (property.schema._flags.presence === "optional") {
      required = false;
    } else if (property.schema._flags.presence === "required") {
      required = true;
    }
  }
  return required;
};

export const getProperties = (joi: ObjectSchema): JoiProperty[] => {
  const properties: JoiProperty[] = [];

  if (joi.$_terms?.keys) {
    properties.push(...joi.$_terms.keys);
  }

  return properties;
};

export const getPropertyName = (
  joiProperty: JoiProperty
): undefined | string => {
  return joiProperty.key;
};

export const getPropertyType = (
  joiProperty: JoiProperty
): undefined | string => {
  return joiProperty.schema?.type;
};
