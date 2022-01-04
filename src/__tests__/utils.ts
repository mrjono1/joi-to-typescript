import { filterMap, isDescribe } from '../utils';

describe('test the utils', () => {
  test('ensure undefined is removed', () => {
    const object = {
      a: 'blue',
      d: undefined
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const children = filterMap(Object.entries(object || {}), ([key, value]) => {
      return value;
    });

    expect(children).toMatchObject(['blue']);
  });

  test('flatten current object', () => {
    const object = {
      a: 'blue',
      b: { c: 'red', d: 'orange' },
      e: 'purple'
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const children = filterMap(Object.entries(object || {}), ([key, value]) => {
      return value;
    });

    expect(children).toMatchObject(['blue', { c: 'red', d: 'orange' }, 'purple']);
  });

  test('isDescribe undefined', () => {
    expect(isDescribe(undefined)).toBe(false);
  });

  test('isDescribe valid with type', () => {
    expect(isDescribe({ type: 'boo' })).toBe(true);
  });

  test('isDescribe invalid', () => {
    expect(isDescribe({})).toBe(false);
  });
});
