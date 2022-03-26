import Joi from 'joi';

/**
 * This file extends the TypeScript Types that are packaged as part of joi
 */

/**
 * Add extra typings that Joi Types does not include
 */
export interface BaseDescribe extends Joi.Description {
  flags?: {
    /**
     * https://joi.dev/api/#anyidid
     */
    id?: string;
    /**
     * https://joi.dev/api/#anylabelname
     */
    label?: string;
    /**
     * https://joi.dev/api/#anydescriptiondesc
     */
    description?: string;
    /**
     * https://joi.dev/api/#anypresencemode
     */
    presence?: 'optional' | 'required';
    /**
     * Default object value
     */
    default?: unknown;
    /**
     * https://joi.dev/api/#objectunknownallow
     */
    unknown?: boolean;
    /**
     * https://joi.dev/api/?v=17.4.2#anycastto
     */
    cast?: 'string' | 'number' | 'map' | 'set';
  };
  /**
   * https://joi.dev/api/#objectpatternpattern-schema-options
   */
  patterns?: {
    schema: Describe;
    rule: Describe;
  }[];
  metas?: Meta[];
}

export interface Meta {
  className?: string;
}

export interface ArrayDescribe extends BaseDescribe {
  type: 'array';
  items: Describe[];
}

export interface ObjectDescribe extends BaseDescribe {
  type: 'object';
  keys: Record<'string', Describe>;
}

export interface AlternativesDescribe extends BaseDescribe {
  // Joi.alt and Joi.alternatives both output as 'alternatives'
  type: 'alternatives';
  matches: { schema: Describe }[];
}

export interface StringDescribe extends BaseDescribe {
  type: 'string';
  allow?: string[];
}

export interface BasicDescribe extends BaseDescribe {
  // Joi.bool an Joi.boolean both output as 'boolean'
  type: 'any' | 'boolean' | 'date' | 'number';
}

export type Describe = ArrayDescribe | BasicDescribe | ObjectDescribe | AlternativesDescribe | StringDescribe;
