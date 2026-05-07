import { evaluateHighestPriority } from '../../game/ai/ai.priority';
import { getEconomyRecommendationUtilityBonus } from '../../game/economy/economy.planner';

describe('AI priority utilities', () => {
  it('normalizes scores and selects the highest candidate deterministically', () => {
    const telemetry = evaluateHighestPriority(
      [{ id: 'a', raw: 2 }, { id: 'b', raw: 10 }],
      (c) => c.raw / 10
    );

    expect(telemetry.chosen?.item.id).toBe('b');
    expect(telemetry.candidates.map((c) => c.score)).toEqual([0.2, 1]);
  });

  it('applies economy recommendation utility bonus for matching build actions', () => {
    const bonus = getEconomyRecommendationUtilityBonus(
      { label: 'Build Womb Well', reason: 'objective', buildingType: 'wombWell' },
      ['build:wombWell']
    );
    expect(bonus).toBeGreaterThan(1);
  });
});
