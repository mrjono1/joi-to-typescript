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
    presence?: 'optional' | 'required' | 'forbidden';
    /**
     * Default object value
     */
    default?: unknown;
    /**
     * https://joi.dev/api/#objectunknownallow
     */
    unknown?: boolean;
    /**
     * https://joi.dev/api/#anycastto
     */
    cast?: 'string' | 'number' | 'map' | 'set';
    /**
     * https://joi.dev/api/#anyonly
     */
    only?: boolean;
  };
  /**
   * https://joi.dev/api/#objectpatternpattern-schema-options
   */
  patterns?: {
    schema?: Describe;
    regex?: string;
    rule: Describe;
  }[];
  metas?: Meta[];
  /**
   * The fist item in this array could be this instead of a value { override?: boolean} or contain { ref : {}};
   */
  allow?: unknown[];
}

/**
 * Meta is a custom object provided by Joi
 * The values here are how this libarary uses it they are not standard Joi
 */
export interface Meta {
  className?: string;
  unknownType?: string;
  readonly?: boolean;
}

export interface ArrayDescribe extends BaseDescribe {
  type: 'array';
  items: Describe[];
}

export interface ObjectDescribe extends BaseDescribe {
  type: 'object';
  keys: Record<'string', Describe>;
}

// We only properly support alternatives where matches have a schema
// This interface represents that
// When matches do not have a schema, like in conditionals, we return 'any' in code
export interface AlternativesDescribe extends BaseDescribe {
  // Joi.alt and Joi.alternatives both output as 'alternatives'
  type: 'alternatives';
  matches: { schema: Describe }[];
}

export interface StringDescribe extends BaseDescribe {
  type: 'string';
}

export interface BasicDescribe extends BaseDescribe {
  // Joi.bool an Joi.boolean both output as 'boolean'
  type: 'any' | 'boolean' | 'date' | 'number';
}

export type Describe = ArrayDescribe | BasicDescribe | ObjectDescribe | AlternativesDescribe | StringDescribe;
