export type SimulationStatusModel = {
  label: string;
  tooltip: string;
  pauseLabel: string;
  pauseAriaLabel: string;
  pausePressed: boolean;
  activeSpeed: 1 | 2 | 4;
  speedAriaLabels: Record<1 | 2 | 4, string>;
};

export function getSimulationStatusModel(isRunning: boolean, tickRate: number): SimulationStatusModel {
  const activeSpeed = tickRate === 2 || tickRate === 4 ? tickRate : 1;
  const label = !isRunning
    ? `Paused · selected speed ${activeSpeed}x`
    : activeSpeed >= 4
      ? `Fast-forward active · ${activeSpeed}x`
      : `Running · ${activeSpeed}x`;

  return {
    label,
    tooltip: isRunning
      ? `Simulation is running at ${activeSpeed}x. Press Space to pause.`
      : `Simulation is paused. Press Space to resume at ${activeSpeed}x.`,
    pauseLabel: isRunning ? 'Pause' : 'Paused',
    pauseAriaLabel: isRunning
      ? `Pause simulation. Current status: ${label}.`
      : `Resume simulation. Current status: ${label}.`,
    pausePressed: !isRunning,
    activeSpeed,
    speedAriaLabels: {
      1: `${activeSpeed === 1 ? 'Selected' : 'Select'} simulation speed 1x.`,
      2: `${activeSpeed === 2 ? 'Selected' : 'Select'} simulation speed 2x.`,
      4: `${activeSpeed === 4 ? 'Selected' : 'Select'} simulation speed 4x.`,
    },
  };
}
