import { readFileSync } from 'fs';
import { join } from 'path';

describe('resource labels', () => {
  it('delegates fallback resource formatting to the shared store helper', () => {
    const source = readFileSync(join(process.cwd(), 'src/ui/panels/resourceLabels.ts'), 'utf8');

    expect(source).toContain("import { resourceLabel } from '../../store/economy.utils';");
    expect(source).toContain('return resourceLabel(resource);');
    expect(source).not.toContain("return resource.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());");
  });
});
