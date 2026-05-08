import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { getCampaignObjectives } from '../../game/core/victory.rules';
import { getSettlementSituationSnapshot } from '../../game/economy/economy.planner';
import { GameScenarioProfile, player1Id, useGameStore } from '../../store/game.store';
import { useSelectionStore } from '../../store/selection.store';

type BriefGoal = {
  label: string;
  done: boolean;
};

const scenarioLabels: Record<GameScenarioProfile, string> = {
  sandbox: 'Sandbox',
  challenging: 'Challenging',
  hardcore: 'Hardcore',
};

export default function SettlementBriefPanel(): JSX.Element {
  const [showSecondaryGoals, setShowSecondaryGoals] = useState(false);
  const selectBuilding = useSelectionStore((state) => state.selectBuilding);
  const {
    activeScenario,
    gameState,
    setScenarioProfile,
  } = useGameStore(
    useShallow((state) => ({
      activeScenario: state.activeScenario,
      gameState: state.gameState,
      setScenarioProfile: state.setScenarioProfile,
    }))
  );

  const brief = useMemo(() => {
    const situation = getSettlementSituationSnapshot(gameState, player1Id);
    const objectives = getCampaignObjectives(gameState, player1Id);
    const activeObjectiveIndex = objectives.findIndex((objective) => !objective.complete);
    const firstVisibleObjective = activeObjectiveIndex < 0
      ? Math.max(0, objectives.length - 6)
      : Math.max(0, activeObjectiveIndex - 1);
    const goals: BriefGoal[] = objectives
      .slice(firstVisibleObjective, firstVisibleObjective + 6)
      .map((objective) => ({
        label: objective.target > 1 ? `${objective.label} ${Math.min(objective.current, objective.target)}/${objective.target}` : objective.label,
        done: objective.complete,
      }));

    return {
      ...situation,
      goals,
    };
  }, [gameState]);

  return (
    <section className="settlement-brief macabre-panel" aria-label="Settlement brief">
      <div className="settlement-brief__header">
        <div>
          <h2>Settlement Brief</h2>
          <p className={`settlement-brief__status settlement-brief__status--${brief.status}`}>{brief.headline}</p>
        </div>
        <div className="settlement-brief__scenario" aria-label="Scenario profile">
          {(Object.keys(scenarioLabels) as GameScenarioProfile[]).map((profile) => (
            <button
              key={profile}
              className={`settlement-brief__scenario-btn ${activeScenario === profile ? 'active' : ''}`}
              onClick={() => setScenarioProfile(profile)}
              aria-pressed={activeScenario === profile}
            >
              {scenarioLabels[profile]}
            </button>
          ))}
        </div>
      </div>

      <div className="settlement-brief__metrics">
        <span><strong>{brief.economy.workingBuildings}</strong> working</span>
        <span><strong>{brief.economy.starvedBuildings}</strong> starved</span>
        <span><strong>{brief.economy.blockedBuildings}</strong> blocked</span>
        <span><strong>{brief.transport.idleCarriers}/{brief.transport.totalCarriers}</strong> carriers idle</span>
        <span><strong>{brief.transport.queuedJobs}</strong> queued</span>
        <span><strong>{Math.round(brief.military.defenseStrength)}</strong> defense</span>
        <span><strong>{Math.round(brief.military.enemyPressure)}</strong> pressure</span>
      </div>

      <div className={`settlement-brief__recommendation settlement-brief__recommendation--${brief.status}`}>
        <span>Next order</span>
        <strong>{brief.primaryAction.label}</strong>
        <small>{brief.primaryAction.detail}</small>
      </div>

      {brief.objective && (
        <div className="settlement-brief__objective" aria-label="Current campaign objective">
          <span>{brief.objective.chapter}</span>
          <strong>{brief.objective.label}</strong>
          <small>{brief.objective.progressLabel}</small>
        </div>
      )}

      {brief.topIssues.length > 0 && (
        <ul className="settlement-brief__issues" aria-label="Settlement issues">
          {brief.topIssues.map((issue) => {
            const issueClassName = `settlement-brief__issue settlement-brief__issue--${issue.tone}`;

            return (
              <li key={`${issue.kind}-${issue.label}`}>
                {issue.buildingId ? (
                  <button
                    type="button"
                    className={`${issueClassName} settlement-brief__issue-btn`}
                    aria-label={`Inspect ${issue.label}`}
                    onClick={() => selectBuilding(issue.buildingId ?? null)}
                  >
                    <strong>{issue.label}</strong>
                    <small>{issue.action}</small>
                  </button>
                ) : (
                  <div className={issueClassName}>
                    <strong>{issue.label}</strong>
                    <small>{issue.action}</small>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="settlement-brief__goal-toggle">
        <button
          type="button"
          className="hud-button"
          onClick={() => setShowSecondaryGoals((value) => !value)}
          aria-expanded={showSecondaryGoals}
        >
          {showSecondaryGoals ? 'Hide secondary goals' : 'Show secondary goals'}
        </button>
      </div>

      {showSecondaryGoals ? (
        <ol className="settlement-brief__goals" aria-label="Suggested build order">
          {brief.goals.map((goal) => (
            <li key={goal.label} className={goal.done ? 'done' : ''}>
              <span aria-hidden="true">{goal.done ? 'Done' : 'Next'}</span>
              {goal.label}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
