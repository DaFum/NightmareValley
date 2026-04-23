import { Path } from './path.types';

export function debugPath(path: Path | null | undefined) {
	if (!path) {
		// eslint-disable-next-line no-console
		console.info('debugPath: no path');
		return;
	}
	// eslint-disable-next-line no-console
	console.info(`debugPath: points=${path.points.length} cost=${path.cost} complete=${path.isComplete}`);
}


