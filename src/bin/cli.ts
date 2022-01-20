#!/usr/bin/env ts-node
/* eslint-disable @typescript-eslint/no-explicit-any */
// noinspection ExceptionCaughtLocallyJS

import {resolve} from 'path';
import {cli, CommandFunction, help} from '@pawelgalazka/cli'
import {convertFromDirectory} from '..';

const joi2ts: CommandFunction = async (options, schemaDirectory, typeOutputDirectory = '.') => {
  try {
    if (!schemaDirectory) {
      throw new Error('Missing schema directory');
    }

    if (typeof options.sort === 'string' && !['name'].includes(options.sort)) {
      throw new Error(`Invalid sort value ${options.sort}`);
    }
    await convertFromDirectory({
      schemaDirectory,
      typeOutputDirectory,
      debug: !!options.debug,
      sortPropertiesByName: options.sort === 'name',
      useLabelAsInterfaceName: !!options.label,
      defaultToRequired: !!options.required,
      flattenTree: !!options.flatten,
      rootDirectoryOnly: !!options.rootOnly,
      ...typeof options.suffix === 'string' && {schemaFileSuffix: options.suffix},
      ...typeof options.indent === 'string' && {indentationChacters: options.indent}
    });
    console.log(`Wrote types generated from JOI schemas to ${resolve(typeOutputDirectory)}`);
  } catch (err: any) {
    console.error(options.debug ? err : `Error: ${err.message}`);
    process.exit(1);
  }
}

help(joi2ts, 'Create TypeScript type definitions from JOI schemas', {
  options: {
    debug: 'Print debug information',
    sort: 'Order of properties in generated interfaces. Allowed values: name. Default: properties are sorted in the order they appear in the schema.',
    label: 'Use .label(\'InterfaceName\') instead of .meta({className:\'InterfaceName\'}) for interface names. Default: false',
    required: 'Make all interface properties required by default, even if the schema does not. Default: false',
    suffix: 'Schema suffix to strip from interface names. Default: "schema"',
    flatten: 'Will not output to subDirectories in output/interface directory. It will flatten the structure. Default: false',
    rootOnly: 'Will only read the files in the root directory of the input/schema directory. Will not parse through sub-directories. Default: false',
    indent: 'Indentation characters. Default: "  " (two spaces)'
  },
  params: ['schemaDir', 'outputDir']
});

cli(joi2ts);
