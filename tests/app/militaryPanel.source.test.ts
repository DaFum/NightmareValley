import { readFileSync } from 'fs';
import { join } from 'path';

describe('MilitaryPanel guidance', () => {
  it('shows recruit costs with resource labels and vault availability', () => {
    const source = readFileSync(join(process.cwd(), 'src/ui/panels/MilitaryPanel.tsx'), 'utf8');

    expect(source).toContain('resourceShortLabel(resource as ResourceType)');
    expect(source).toContain('{current}/{amount}');
    expect(source).toContain('Vault is short');
  });

  it('explains the hostile choir win condition', () => {
    const source = readFileSync(join(process.cwd(), 'src/ui/panels/MilitaryPanel.tsx'), 'utf8');

    expect(source).toContain('Break the Hostile Choir');
    expect(source).toContain('repel 2 raids');
    expect(source).toContain('pressure to 10 or lower');
  });

  it('explains unfinished or disconnected recruit buildings before enabling recruitment', () => {
    const source = readFileSync(join(process.cwd(), 'src/ui/panels/MilitaryPanel.tsx'), 'utf8');

    expect(source).toContain('under construction');
    expect(source).toContain('Connect roads');
    expect(source).toContain('isRecruitReady');
  });

  it('explains paused recruit buildings before reporting soldier slots full', () => {
    const source = readFileSync(join(process.cwd(), 'src/ui/panels/MilitaryPanel.tsx'), 'utf8');

    expect(source).toContain('pausedRecruitBuildings');
    expect(source).toContain('isRecruitPaused');
    expect(source).toContain('Recruit buildings are paused');
  });
});
