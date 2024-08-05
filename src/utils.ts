import { Describe } from 'joiDescribeTypes';

/**
 * Applies the mapper over each element in the list.
 * If the mapper returns undefined it will not show up in the result
 *
 * @param list - array to filter + map
 * @param mapper - mapper func to apply to map
 */
export function filterMap<T, K>(list: T[], mapper: (t: T) => K | undefined): K[] {
  return list.reduce((res: K[], val: T) => {
    const mappedVal = mapper(val);
    if (mappedVal !== undefined) {
      res.push(mappedVal);
    }
    return res;
  }, []);
}

/**
 * Escape value so that it can be go into single quoted string literal.
 * @param value
 */
export function toStringLiteral(value: string, doublequoteEscape: boolean): string {
  const escapeChar = doublequoteEscape ? '"' : "'";

  value = value.replace(/\\/g, '\\\\');
  if (doublequoteEscape) {
    value = value.replace(/"/g, '\\"');
  } else {
    value = value.replace(/'/g, "\\'");
  }

  return `${escapeChar}${value}${escapeChar}`;
}

export function isDescribe(x: unknown): x is Describe {
  if (!x) {
    return false;
  }

  if ((x as Describe).type) {
    return true;
  }

  return false;
}
