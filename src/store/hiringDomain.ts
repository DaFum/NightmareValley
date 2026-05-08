import type { ResourceType } from '../game/core/economy.types';
import { resourceLabel } from './economy.utils';

export type MissingCostEntry = {
  resource: ResourceType;
  available: number;
  required: number;
};

export type WorkerHireButtonStateInput = {
  workerName: string;
  current: number;
  max: number;
  atPopulationCap: boolean;
  canAfford: boolean;
  missingCosts: MissingCostEntry[];
};

export type WorkerHireButtonState = {
  disabled: boolean;
  label: string;
  title: string;
};

function pluralizeWorkerName(name: string): string {
  if (name.endsWith('s')) return name;
  return `${name}s`;
}

export function getWorkerHireButtonState({
  workerName,
  current,
  max,
  atPopulationCap,
  canAfford,
  missingCosts,
}: WorkerHireButtonStateInput): WorkerHireButtonState {
  if (current >= max) {
    return {
      disabled: true,
      label: 'Full',
      title: `${current}/${max} ${pluralizeWorkerName(workerName)} already assigned.`,
    };
  }

  if (atPopulationCap) {
    return {
      disabled: true,
      label: 'Hire',
      title: 'Population limit reached.',
    };
  }

  if (!canAfford) {
    const missing = missingCosts
      .map(({ resource, available, required }) => `${resourceLabel(resource)} ${required} required, ${available} available`)
      .join(', ');
    return {
      disabled: true,
      label: 'Hire',
      title: missing ? `Vault is short: ${missing}.` : 'Vault lacks the required hiring resources.',
    };
  }

  return {
    disabled: false,
    label: 'Hire',
    title: `Hire ${workerName}.`,
  };
}
