import { readFileSync } from 'fs';
import { join } from 'path';

describe('SettlementBriefPanel issue actions', () => {
  it('renders building-linked issues as inspector buttons', () => {
    const source = readFileSync(join(process.cwd(), 'src/ui/panels/SettlementBriefPanel.tsx'), 'utf8');

    expect(source).toContain("import { useSelectionStore } from '../../store/selection.store'");
    expect(source).toContain('const selectBuilding = useSelectionStore((state) => state.selectBuilding);');
    expect(source).toContain('issue.buildingId ?');
    expect(source).toContain('aria-label={`Inspect ${issue.label}`}');
    expect(source).toContain('onClick={() => selectBuilding(issue.buildingId ?? null)}');
    expect(source).toContain('settlement-brief__issue-btn');
  });
});
