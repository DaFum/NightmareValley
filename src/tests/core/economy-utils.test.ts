import { resourceLabel } from '../../store/economy.utils';

describe('economy utils', () => {
  it('formats uppercase-leading camelCase labels without a leading space', () => {
    expect(resourceLabel('FooBar')).toBe('Foo Bar');
  });
});
