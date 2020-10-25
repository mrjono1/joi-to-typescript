/**
 * Applies the mapper over each element in the list.
 * If the mapper returns undefined it will not show up in the result
 *
 * list - array to filter + map
 * mapper: mapper func to apply to map
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
