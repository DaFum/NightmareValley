import { getWorkerDefinition, WORKER_DEFINITIONS } from '../../core/economy.data';

export function getWorkerDef(type: string) {
	try {
		return getWorkerDefinition(type as any) ?? null;
	} catch (e) {
		return null;
	}
}

export function listWorkerTypes() {
	// Use the ESM export from economy.data instead of CommonJS `require`.
	return Object.keys(WORKER_DEFINITIONS || {});
}


