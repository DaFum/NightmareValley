import { getWorkerDefinition } from '../../core/economy.data';

export function getWorkerDef(type: string) {
	try {
		return getWorkerDefinition(type as any);
	} catch (e) {
		return null;
	}
}

export function listWorkerTypes() {
	// economy.data exports WORKER_DEFINITIONS; import lazily to avoid cycles
	const mod = require('../../core/economy.data');
	return Object.keys(mod.WORKER_DEFINITIONS || {});
}


